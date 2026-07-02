import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import { authService } from '@/features/auth/services/auth.service';
import { isStrongPassword, PASSWORD_REQUIREMENT_MESSAGE } from '@/features/auth/validation';
import { useOnboardingStore } from '@/store/onboarding';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (mode === 'signup') {
      if (!isStrongPassword(password)) {
        setError(PASSWORD_REQUIREMENT_MESSAGE);
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
              onPress={() => setMode('signup')}
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
              onPress={() => setMode('login')}
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
              <TouchableOpacity className="self-end">
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
            >
              <Ionicons name="logo-facebook" size={18} color="#ffffff" />
              <Text className="font-body-md text-body-md text-on-primary">
                Continue with Facebook
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
