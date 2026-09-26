# Release — Eu Reciclo v1.4.10

Version name: 1.4.10  
Android versionCode: 10410  
Application ID: `com.eureciclo.app`

## Destaques

- Corrigida a validação final do certificado do APK Release.
- O `Build-Android-APK-14` comprovou que o APK foi compilado, que o launcher oficial passou na validação e que a assinatura é válida com o certificado `CN=Eu Reciclo`.
- A falha era somente de leitura do relatório: o workflow esperava `Signer #1 certificate SHA-256 digest`, mas o `apksigner` atual informou `V2 Signer: certificate SHA-256 digest`.
- O novo extrator reconhece os dois formatos e normaliza o digest SHA-256 antes de compará-lo ao certificado exportado do keystore permanente.
- A publicação continua bloqueada se o certificado real do APK for diferente do keystore configurado.
- A validação do launcher oficial no APK continua obrigatória antes da publicação.

## APK

O workflow gera `Eu-Reciclo-v1.4.10.apk` a partir de `app-release.apk`. Antes de publicar, valida o launcher, verifica criptograficamente a assinatura com `apksigner` e compara o SHA-256 do certificado do APK com o certificado do keystore permanente.
