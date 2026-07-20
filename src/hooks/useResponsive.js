import { useWindowDimensions } from 'react-native';

/**
 * Shared responsive scaling hook.
 *
 * Baseline is a 390px-wide device (iPhone 14 Pro). Every screen that calls
 * this hook gets the same scale factor derived from the CURRENT window size,
 * so fonts, spacing, and fixed-size elements grow/shrink together instead of
 * each screen inventing its own baseline (which is what Scan.jsx was doing
 * on its own before).
 *
 * Usage:
 *   const { rs, wp, hp, width, height, isTablet } = useResponsive();
 *   fontSize: rs(16)          // scales a "designed at 390px" value
 *   width: wp(90)             // 90% of screen width
 *   height: hp(30)            // 30% of screen height
 */
export default function useResponsive(baselineWidth = 390) {
  const { width, height } = useWindowDimensions();

  // Clamp the scale so things don't get comically huge on tablets/large
  // phones, and don't shrink into unreadable text on the smallest devices.
  const rawScale = Math.min(width, height) / baselineWidth;
  const scale = Math.min(Math.max(rawScale, 0.85), 1.6);

  // rs = "responsive size" - scales a pixel value designed at baselineWidth
  const rs = (size) => Math.round(size * scale);

  // Percentage-of-screen helpers, handy for widths/heights that should track
  // the viewport directly rather than a fixed baseline.
  const wp = (percent) => Math.round((percent / 100) * width);
  const hp = (percent) => Math.round((percent / 100) * height);

  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;

  return { rs, wp, hp, width, height, scale, isTablet, isLandscape };
}
