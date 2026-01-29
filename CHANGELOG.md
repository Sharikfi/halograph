# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-29

### Added

- Nuxt module for halftone effect (single-color dot grid from images)
- `HalographImage` component with props: src, options, output (canvas | image)
- `useHalograph` composable with reactive src/options, result, error, isLoading, toDataURL
- Options: color (HEX/RGB), dotType (circle/square/triangle), effectType (scale/opacity/both), spacing, maxWidth, maxHeight
- CORS handling and optional server proxy `/api/_halograph/proxy` for external images
- Error and loading slots; error boundaries
- Performance: maxWidth/maxHeight downscale, Web Worker for large images
- TypeScript types via addTypeTemplate; JSDoc for public API
- Unit tests (color, halftone, useHalograph) and E2E fixture

[1.0.0]: https://github.com/your-org/halograph/releases/tag/v1.0.0
