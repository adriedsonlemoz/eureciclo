# Release — Eu Reciclo v1.4.11

Version name: 1.4.11  
Android versionCode: 10411  
Application ID: `com.eureciclo.app`

## Destaques

- Novo ícone oficial integrado ao aplicativo, launcher Android, favicon e splash nativa.
- A imagem-base agora preenche todo o quadrado com verde: não existem bordas ou cantos pretos incorporados ao PNG.
- Launchers legacy continuam disponíveis em `mdpi`, `hdpi`, `xhdpi`, `xxhdpi` e `xxxhdpi`.
- Android 8.0/API 26 ou superior continua usando adaptive icon, permitindo que cada launcher aplique sua própria máscara sem cortar o símbolo principal.
- `android:roundIcon` continua apontando para uma variante circular dedicada.
- A validação pré-build rejeita launcher principal com cantos pretos opacos.
- Assinatura Release permanente e validação pós-build do APK permanecem inalteradas.

## APK

O workflow gera `Eu-Reciclo-v1.4.11.apk` a partir de `app-release.apk`. Antes de publicar, valida os recursos do launcher, confere o ícone no APK final, verifica a assinatura com `apksigner` e compara o certificado com o keystore permanente.
