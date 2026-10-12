import { IViewHistoryEntry } from '../types';

export interface SpikeDetectionResult {
  isSpike: boolean;
  reason?: string;
  velocity?: number; // views per second
}

export class SpikeDetectionService {
  // Configurable thresholds for anomaly detection
  private static VELOCITY_THRESHOLD_VPS = 1000; // > 1,000 views/sec
  private static RAPID_SURGE_VIEWS = 50000; // >= 50,000 views
  private static RAPID_SURGE_SECONDS = 60; // within 60 seconds
  private static SINGLE_JUMP_THRESHOLD = 200000; // >= 200,000 views in a single step

  public static analyzeViewUpdate(
    currentViews: number,
    newViews: number,
    viewHistory: IViewHistoryEntry[],
    currentTime: Date = new Date()
  ): SpikeDetectionResult {
    // If views didn't increase, not a positive spike
    if (newViews <= currentViews) {
      return { isSpike: false };
    }

    const deltaViews = newViews - currentViews;

    // Check 1: Massive absolute jump in a single call
    if (deltaViews >= this.SINGLE_JUMP_THRESHOLD) {
      return {
        isSpike: true,
        reason: `Sudden massive view surge of +${deltaViews.toLocaleString()} views in a single update.`,
        velocity: deltaViews
      };
    }

    // Check 2: Historical velocity comparison
    if (viewHistory && viewHistory.length > 0) {
      const lastEntry = viewHistory[viewHistory.length - 1];
      const elapsedSeconds = Math.max(
        1,
        (currentTime.getTime() - new Date(lastEntry.timestamp).getTime()) / 1000
      );

      const velocity = deltaViews / elapsedSeconds;

      // Rapid surge check (e.g. 50k views in under 60 seconds)
      if (deltaViews >= this.RAPID_SURGE_VIEWS && elapsedSeconds <= this.RAPID_SURGE_SECONDS) {
        return {
          isSpike: true,
          reason: `Rapid surge detected: +${deltaViews.toLocaleString()} views within ${Math.round(elapsedSeconds)}s (${Math.round(velocity)} views/sec).`,
          velocity
        };
      }

      // High velocity rate check
      if (velocity >= this.VELOCITY_THRESHOLD_VPS && deltaViews > 5000) {
        return {
          isSpike: true,
          reason: `Unusually high view velocity: ${Math.round(velocity)} views/sec (+${deltaViews.toLocaleString()} in ${Math.round(elapsedSeconds)}s).`,
          velocity
        };
      }
    }

    return { isSpike: false };
  }
}
