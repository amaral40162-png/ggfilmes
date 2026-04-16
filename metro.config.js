const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Melhora a compatibilidade com Firebase 9+ e outras libs modernas
config.resolver.sourceExts.push('mjs');

// Permite que o Metro entenda o campo "exports" do package.json (essencial para Firebase 11+)
config.resolver.unstable_enablePackageExports = true;

// Define a ordem de prioridade para a web e mobile
config.resolver.resolverMainFields = ['browser', 'module', 'main'];

module.exports = config;
