import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Dimensions, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import SellStepHeader from '../components/SellStepHeader';
import PhotoGrid from '../components/PhotoGrid';
import { Ionicons } from '@expo/vector-icons';
import { useSellFlow } from '../hooks/useSellFlow';
import { sellService } from '../services/sell.service';
import type { PhotoAngle, SellPhoto } from '../types/sell.types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PHOTO_ANGLES: PhotoAngle[] = ['leftSide', 'rightSide', 'top', 'soles', 'insoles'];

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  leftSide: 'Left Side View',
  rightSide: 'Right Side View',
  top: 'Top View',
  soles: 'Soles',
  insoles: 'Insoles',
};

/** Max width photos are resized to before upload. Cuts file size drastically
 * with no visible quality loss for AI valuation, since raw camera photos come
 * in at full sensor resolution (often 3000px+ wide, several MB each). */
const UPLOAD_MAX_WIDTH = 800;

async function compressForUpload(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: UPLOAD_MAX_WIDTH } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

export default function PhotoUploadContainer() {
  const router = useRouter();
  const { photos, setPhoto, allPhotosUploaded, setStep, flowMode, photosDirty, setAnalysisSkipped } = useSellFlow();
  const isEditingUnchanged = flowMode === 'edit' && !photosDirty;
  const [pendingAngle, setPendingAngle] = useState<PhotoAngle | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ uri: string; angle: PhotoAngle } | null>(null);
  const [queuedAction, setQueuedAction] = useState<{ type: 'camera' | 'library'; angle: PhotoAngle } | null>(null);
  const [uploading, setUploading] = useState(false);

  function handlePhotoPress(angle: PhotoAngle) {
    setPendingAngle(angle);
  }

  async function runPicker(type: 'camera' | 'library', angle: PhotoAngle) {
    try {
      if (type === 'camera') {
        const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
          if (!canAskAgain) {
            Alert.alert(
              'Camera Access Needed',
              'Go to Settings > Resole > Camera and enable access.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          }
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
        if (!result.canceled && result.assets[0]) {
          const uri = await compressForUpload(result.assets[0].uri);
          setPreviewPhoto({ uri, angle });
        }
      } else {
        const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
          if (!canAskAgain) {
            Alert.alert(
              'Photo Access Needed',
              'Go to Settings > Resole > Photos and enable access.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          }
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
        if (!result.canceled && result.assets[0]) {
          const uri = await compressForUpload(result.assets[0].uri);
          setPreviewPhoto({ uri, angle });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera. Please try again.');
    }
  }

  // iOS-only: fires after the modal is fully gone, so the picker isn't presented
  // over a still-visible modal. Android's Modal never calls onDismiss, so there we
  // launch the picker directly from the button handlers instead.
  function handlePickerModalDismiss() {
    if (!queuedAction) return;
    const { type, angle } = queuedAction;
    setQueuedAction(null);
    runPicker(type, angle);
  }

  function launchOrQueue(type: 'camera' | 'library', angle: PhotoAngle) {
    setPendingAngle(null);
    if (Platform.OS === 'ios') {
      // Defer until the modal's onDismiss fires.
      setQueuedAction({ type, angle });
    } else {
      // Android: the picker is a separate activity, launch it right away.
      runPicker(type, angle);
    }
  }

  function handleCameraPress() {
    if (!pendingAngle) return;
    launchOrQueue('camera', pendingAngle);
  }

  function handleLibraryPress() {
    if (!pendingAngle) return;
    launchOrQueue('library', pendingAngle);
  }

  function handleConfirmPhoto() {
    if (!previewPhoto) return;
    setPhoto(previewPhoto.angle, { angle: previewPhoto.angle, uri: previewPhoto.uri, uploaded: false });
    setPreviewPhoto(null);
  }

  function handleRetakePhoto() {
    setPreviewPhoto(null);
  }

  async function handleAnalyze() {
    if (uploading) return;

    const list = PHOTO_ANGLES.map((angle) => photos[angle]).filter(Boolean) as SellPhoto[];
    if (list.length < PHOTO_ANGLES.length) return;

    // Only (re-)upload photos that are still local files. Untouched angles from
    // an edit session already have a remoteUrl and re-sending their http(s) uri
    // as a multipart file part wouldn't work anyway.
    const toUpload = list.filter((p) => !p.uploaded);

    setUploading(true);
    try {
      if (toUpload.length > 0) {
        const { photos: uploaded } = await sellService.uploadPhotos(toUpload);
        uploaded.forEach((u) =>
          setPhoto(u.angle, {
            angle: u.angle,
            uri: photos[u.angle]!.uri,
            uploaded: true,
            remoteUrl: u.remoteUrl,
          })
        );
      }
      setAnalysisSkipped(false);
      setStep('aiResults');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleContinueUnchanged() {
    if (!isEditingUnchanged) return;
    setAnalysisSkipped(true);
    setStep('editListing');
  }

  const uploadedCount = Object.values(photos).filter(Boolean).length;
  const previewSize = SCREEN_WIDTH - 48;

  return (
    <View className="flex-1 bg-surface">
      <SellStepHeader
        title="Upload Photos"
        stepLabel="Step 1 of 4"
        onClose={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="font-title-md text-title-md text-on-surface mb-1">
            5 angles required
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant">
            Clear, well-lit photos get better AI valuations.
          </Text>
        </View>

        <PhotoGrid photos={photos} onPhotoPress={handlePhotoPress} />

        <View className="flex-row items-center gap-2 mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{ backgroundColor: i < uploadedCount ? '#0054d3' : '#c2c6d8' }}
            />
          ))}
        </View>
        <Text className="font-label-md text-label-md text-on-surface-variant mt-1 text-center">
          {uploadedCount} of 5 uploaded
        </Text>
      </ScrollView>

      <View className="px-4 pb-8 pt-2">
        {isEditingUnchanged && (
          <Text className="font-label-md text-label-md text-on-surface-variant text-center mb-2">
            Photos are unchanged — no need to re-analyze.
          </Text>
        )}
        <TouchableOpacity
          onPress={isEditingUnchanged ? handleContinueUnchanged : handleAnalyze}
          disabled={isEditingUnchanged ? false : !allPhotosUploaded || uploading}
          className="rounded-full py-4 items-center"
          style={{
            backgroundColor: isEditingUnchanged || allPhotosUploaded ? '#0054d3' : '#c2c6d8',
            shadowColor: isEditingUnchanged || allPhotosUploaded ? '#0054d3' : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: isEditingUnchanged || allPhotosUploaded ? 6 : 0,
          }}
        >
          {uploading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="font-body-md text-body-md" style={{ color: '#ffffff' }}>
                Uploading…
              </Text>
            </View>
          ) : (
            <Text
              className="font-body-md text-body-md"
              style={{ color: isEditingUnchanged || allPhotosUploaded ? '#ffffff' : '#727687' }}
            >
              {isEditingUnchanged ? 'Continue' : 'Analyze with AI'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Photo source picker */}
      <Modal
        visible={pendingAngle !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingAngle(null)}
        onDismiss={handlePickerModalDismiss}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setPendingAngle(null)}
        />
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 36,
            paddingTop: 8,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#c2c6d8',
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          <TouchableOpacity
            onPress={handleCameraPress}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 14 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="camera" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '600' }}>Take Photo</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Use your camera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLibraryPress}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 14 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="images" size={20} color="#7C3AED" />
            </View>
            <View>
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '600' }}>Choose from Library</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Pick from your photos</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: '#e8eaf0', marginHorizontal: 24, marginVertical: 4 }} />

          <TouchableOpacity
            onPress={() => setPendingAngle(null)}
            style={{ paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, color: '#727687' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Photo preview / confirm */}
      <Modal
        visible={previewPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={handleRetakePhoto}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          {previewPhoto && (
            <>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                {ANGLE_LABELS[previewPhoto.angle]}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>
                Does this look good?
              </Text>

              <View
                style={{
                  width: previewSize,
                  height: previewSize,
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 32,
                }}
              >
                <Image
                  source={{ uri: previewPhoto.uri }}
                  style={{ width: previewSize, height: previewSize }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={handleRetakePhoto}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 50,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmPhoto}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 50,
                    backgroundColor: '#0054d3',
                    alignItems: 'center',
                    shadowColor: '#0054d3',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 6,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Use Photo</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}
