/**
 * imagePicker.shim.ts
 *
 * Lazy-requires expo-image-picker so the app doesn't crash in Expo Go if the
 * native 'ExpoImagePicker' module is absent. All functions fall back to no-ops
 * that resolve to { canceled: true } or a denied-permission response.
 */

type ImagePickerResult = { canceled: boolean; assets?: any[] };
type PermissionResult  = { status: string; granted: boolean; canAskAgain: boolean };
type LaunchOptions     = Record<string, any>;

const CANCELED:  ImagePickerResult = { canceled: true };
const DENIED: PermissionResult     = { status: 'denied', granted: false, canAskAgain: false };

// Stub satisfying the parts of the expo-image-picker API used in this project.
const stub = {
  launchImageLibraryAsync:         async (_opts?: LaunchOptions): Promise<ImagePickerResult> => CANCELED,
  launchCameraAsync:               async (_opts?: LaunchOptions): Promise<ImagePickerResult> => CANCELED,
  requestMediaLibraryPermissionsAsync: async (): Promise<PermissionResult> => DENIED,
  requestCameraPermissionsAsync:       async (): Promise<PermissionResult> => DENIED,
  // Enum passthrough — keeps spread on MediaTypeOptions.Images working
  MediaTypeOptions: { All: 'All', Images: 'Images', Videos: 'Videos' } as const,
  UIImagePickerControllerQualityType: {},
};

type ImagePickerModule = typeof stub;

let _mod: ImagePickerModule = stub;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _mod = require('expo-image-picker') as ImagePickerModule;
} catch {
  // Expo Go — stub stays active; picking will silently return { canceled: true }
}

export default _mod;
export const {
  launchImageLibraryAsync,
  launchCameraAsync,
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  MediaTypeOptions,
} = _mod;
