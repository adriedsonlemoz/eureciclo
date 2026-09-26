# Release — Eu Reciclo v1.4.8

Version name: 1.4.8  
Android versionCode: 10408  
Application ID: `com.eureciclo.app`

## Destaques

- Corrigida a validação pós-build que gerava falso erro ao interpretar `aapt dump badging`.
- O launcher declarado pelo APK agora é conferido diretamente no Manifest binário.
- `android:icon` precisa resolver para `@mipmap/ic_launcher` e `android:roundIcon` para `@mipmap/ic_launcher_round` na `resources.arsc`.
- Continua ativa a comparação visual por pixels dos launchers e do foreground adaptativo realmente empacotados.
- Assinatura Release permanente permanece obrigatória e validada com `apksigner`.

## APK

O workflow gera `Eu-Reciclo-v1.4.8.apk` a partir de `app-release.apk`. A publicação só ocorre depois de validar assinatura, Manifest, tabela de recursos e pixels do ícone empacotado.
