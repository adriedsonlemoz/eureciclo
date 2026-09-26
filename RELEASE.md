# Release — Eu Reciclo v1.4.6

Data: 2026-09-26  
Android versionCode: 10406  
Application ID: `com.eureciclo.app`

## Alterações desta versão

- Build de produção alterado de Debug para Release.
- APK passa a ser assinado com a chave permanente fornecida pelos GitHub Secrets.
- O workflow falha se qualquer secret de assinatura estiver ausente.
- Não existe fallback silencioso para o certificado Android Debug.
- O certificado do APK é conferido com `apksigner` e comparado ao certificado do keystore antes da publicação.
- Arquivos `.jks`, `.keystore` e `key.properties` foram protegidos no `.gitignore`.
- Pull requests continuam validando código e Android sem publicar APK nem exigir acesso aos secrets.

## Secrets necessários

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## Entrega

O workflow gera `Eu-Reciclo-v1.4.6.apk` a partir de `app-release.apk` e publica o APK assinado diretamente na GitHub Release `v1.4.6`.
