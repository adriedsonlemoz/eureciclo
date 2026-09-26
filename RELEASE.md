# Release — Eu Reciclo v1.4.7

Version name: 1.4.7  
Android versionCode: 10407  
Application ID: `com.eureciclo.app`

## Destaques

- Launcher Android reforçado para remover recursos padrão do Capacitor antes da aplicação do ícone oficial.
- Adaptive icon com foreground em densidade xxxhdpi correta.
- Verificação pré-build do Manifest e de todas as densidades do launcher.
- Verificação pós-build dentro do APK usando `aapt` e comparação dos pixels do ícone oficial.
- Publicação bloqueada se o APK não carregar a identidade visual correta.
- Assinatura Release permanente continua obrigatória via GitHub Secrets.

## APK

O workflow gera `Eu-Reciclo-v1.4.7.apk` a partir de `app-release.apk` e só publica a Release após validar tanto a assinatura quanto o ícone empacotado.
