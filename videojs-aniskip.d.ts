import { PluginFunction, VideoJsPlayer, Plugin } from 'video.js';

export interface SkipRange {
  start: number;
  end: number;
  type: string;
}

export interface AniSkipOptions {
  apiBaseUrl?: string;
  malId?: number;
  episodeNumber?: number;
  episodeLength?: number;
  types?: string[];
  buttonText?: { op?: string; ed?: string; default?: string };
  buttonClass?: string;
  notificationClass?: string;
  notificationText?: { op?: string; ed?: string; default?: string };
  skipRanges?: SkipRange[];
  autoSkip?: boolean;
  offset?: number;
}

export interface AniSkipState {
  isLoading: boolean;
  error: string | null;
  inSkipRange: boolean;
  currentSkipRange: SkipRange | null;
  skipSegments: SkipRange[];
}

export interface AniSkipPlugin extends Plugin<AniSkipOptions> {
  state: AniSkipState;
  fetchSkipSegments(): void;
}

// Main plugin export
declare const plugin: PluginFunction<AniSkipOptions>;
export default plugin;

// Augment Video.js player interface
declare module 'video.js' {
  interface VideoJsPlayer {
    aniskip(options?: AniSkipOptions): AniSkipPlugin;
  }
}
