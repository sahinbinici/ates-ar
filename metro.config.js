// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// GLB/GLTF 3D model dosyalarını asset olarak bundle'a dahil et
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
