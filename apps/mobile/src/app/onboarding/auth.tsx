import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import { authService } from '@/features/auth/services/auth.service';
import { isStrongPassword, PASSWORD_REQUIREMENT_MESSAGE } from '@/features/auth/validation';
import { useOnboardingStore } from '@/store/onboarding';

type AuthMode = 'login' | 'signup';
type AuthStep = 'credentials' | 'forgot-password' | 'check-email';

interface ComingSoonProps {
  visible: boolean;
  method: string;
  onClose: () => void;
}

function ComingSoon({ visible, method, onClose }: ComingSoonProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, alignItems: 'center' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <View
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}
          >
            <Ionicons name={`logo-${method.toLowerCase()}` as any} size={26} color="#2563EB" />
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', letterSpacing: 0.5, marginBottom: 4 }}>
            COMING SOON
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' }}>
            Log in via {method}
          </Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 }}>
            Hang in there. Soon, we will let you connect via {method}!
          </Text>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{ backgroundColor: '#2563EB', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [mode, setMode] = useState<AuthMode>('signup');
  const [step, setStep] = useState<AuthStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<string>('')

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  const handleSubmit = async () => {
    setError(null);
    if (email.length === 0) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length === 0) {
      setError("Please enter a password.");
      return;
    }
    if (mode === 'signup') {
      if (!isStrongPassword(password)) {
        setError(PASSWORD_REQUIREMENT_MESSAGE);
        return;
      }
      if (confirmPassword.length === 0) {
        setError("Please confirm your password.");
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await authService.signUp(email, password);
        router.push('/onboarding/details');
      } else {
        await authService.signIn(email, password);
        completeOnboarding();
        router.replace('/market');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      resetFields();
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(email);
    setForgotError(null);
    setStep('forgot-password');
  };

  const backToCredentials = () => {
    setForgotError(null);
    setStep('credentials');
  };

  const handleForgotPasswordSubmit = async () => {
    setForgotError(null);
    if (forgotEmail.length === 0) {
      setForgotError('Please enter a valid email.');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setStep('check-email');
    } catch (e: any) {
      setForgotError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingHeader
          showBack={router.canGoBack()}
          onBack={() => router.back()}
          logo
        />

        {step === 'credentials' && (
          <View className="px-8 gap-8 mt-2">
            {/* Welcome section */}
            <View className="items-center gap-1">
              <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
                Welcome to Resole
              </Text>
              <Text className="font-body-md text-body-md text-on-surface-variant text-center">
                Sign up to start swapping.
              </Text>
            </View>

            {/* Mode toggle */}
            <View
              className="flex-row rounded-full bg-surface-container-low p-1"
              style={{ borderWidth: 1, borderColor: '#e0e2ec' }}
            >
              <TouchableOpacity
                onPress={() => {
                  setMode('signup');
                  resetFields();
                }}
                className="flex-1 py-2 rounded-full items-center"
                style={{ backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent' }}
              >
                <Text
                  className="font-body-md text-body-md"
                  style={{ color: mode === 'signup' ? '#1a1c20' : '#727687' }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMode('login');
                  resetFields();
                }}
                className="flex-1 py-2 rounded-full items-center"
                style={{ backgroundColor: mode === 'login' ? '#ffffff' : 'transparent' }}
              >
                <Text
                  className="font-body-md text-body-md"
                  style={{ color: mode === 'login' ? '#1a1c20' : '#727687' }}
                >
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email / password fields */}
            <View className="gap-3">
              <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="#727687"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-3 px-4 font-body-md text-body-md text-on-surface"
                />
              </View>

              <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#727687"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-3 px-4 font-body-md text-body-md text-on-surface"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  className="px-3"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#727687"
                  />
                </TouchableOpacity>
              </View>

              {mode === 'signup' && (
                <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor="#727687"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 py-3 px-4 font-body-md text-body-md text-on-surface"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    className="px-3"
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#727687"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {mode === 'login' && (
                <TouchableOpacity className="self-end" onPress={openForgotPassword}>
                  <Text className="font-body-sm text-body-sm text-primary">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              )}

              {error && (
                <Text className="font-body-sm text-body-sm text-error text-center">
                  {error}
                </Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-primary rounded-full py-3 items-center"
              style={{
                opacity: loading ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <Text className="font-body-md text-body-md text-on-primary">
                {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-outline-variant" />
              <Text className="font-body-sm text-body-sm text-on-surface-variant">or</Text>
              <View className="flex-1 h-px bg-outline-variant" />
            </View>

            {/* Social auth buttons */}
            <View className="gap-2">
              <TouchableOpacity
                className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full bg-surface-container-lowest border border-outline-variant"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 2,
                }}
                onPress={() => setMethod('Google')}
              >
                <Ionicons name="logo-google" size={18} color="#424655" />
                <Text className="font-body-md text-body-md text-on-surface">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full"
                style={{
                  backgroundColor: '#131b2e',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 2,
                }}
                onPress={() => setMethod('Apple')}
              >
                <Ionicons name="logo-apple" size={18} color="#ffffff" />
                <Text className="font-body-md text-body-md text-on-primary">
                  Continue with Apple ID
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full"
                style={{
                  backgroundColor: '#1877F2',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 2,
                }}
                onPress={() => setMethod('Facebook')}
              >
                <Ionicons name="logo-facebook" size={18} color="#ffffff" />
                <Text className="font-body-md text-body-md text-on-primary">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ComingSoon
          visible={method != ''}
          method={method}
          onClose={() => setMethod('')}
        />

        {step === 'forgot-password' && (
          <View className="px-8 gap-8 mt-2">
            <View className="items-center gap-1">
              <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
                Reset your password
              </Text>
              <Text className="font-body-md text-body-md text-on-surface-variant text-center">
                Enter your account email and we'll send you a link to set a new password.
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <TextInput
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  placeholder="Email address"
                  placeholderTextColor="#727687"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!forgotLoading}
                  className="flex-1 py-3 px-4 font-body-md text-body-md text-on-surface"
                  style={{ opacity: forgotLoading ? 0.6 : 1 }}
                />
              </View>

              {forgotError && (
                <Text className="font-body-sm text-body-sm text-error text-center">
                  {forgotError}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleForgotPasswordSubmit}
              disabled={forgotLoading}
              className="bg-primary rounded-full py-3 items-center"
              style={{
                opacity: forgotLoading ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <Text className="font-body-md text-body-md text-on-primary">
                {forgotLoading ? 'Please wait…' : 'Send reset link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={backToCredentials} className="items-center">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Back to log in
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'check-email' && (
          <View className="px-8 gap-4 mt-2 items-center">
            <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
              Check your email
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant text-center">
              If an account exists for {forgotEmail}, we've sent a link to reset your password.
              Open it on this device to set a new password, then come back here to log in.
            </Text>
            <TouchableOpacity
              onPress={() => {
                resetFields();
                setMode('login');
                setStep('credentials');
              }}
              className="mt-2"
            >
              <Text className="font-body-sm text-body-sm text-primary">
                I've reset my password — back to log in
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
