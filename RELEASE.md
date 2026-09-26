# Release — Eu Reciclo v1.4.9

Version name: 1.4.9  
Android versionCode: 10409  
Application ID: `com.eureciclo.app`

## Destaques

- Corrigido o falso erro `legacyEntry` da validação pós-build.
- O APK Release pode encurtar nomes físicos dos arquivos de recursos durante `optimizeReleaseResources`; isso é normal e não significa que o launcher desapareceu.
- O launcher final é validado pelo `AndroidManifest.xml` binário e pela `resources.arsc`, exigindo `@mipmap/ic_launcher`, `@mipmap/ic_launcher_round`, `@drawable/ic_launcher_foreground` e `@color/ic_launcher_background`.
- Quando os caminhos físicos dos PNGs estão disponíveis na tabela de recursos, a validação compara seus pixels com os ícones oficiais.
- Assinatura Release permanente continua obrigatória e validada com `apksigner`.

## APK

O workflow gera `Eu-Reciclo-v1.4.9.apk` a partir de `app-release.apk`. A publicação só ocorre depois de validar a assinatura e a identidade do launcher dentro do APK sem depender de nomes físicos que podem ser alterados pelo otimizador Android.
