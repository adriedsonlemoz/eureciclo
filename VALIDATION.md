# Validação — Eu Reciclo v1.4.8

Validações desta entrega:

- `npm test`: **29/29 testes aprovados**, incluindo fixture que simula adaptive icon anunciado como XML pelo Android.
- `npm run check:version`: **aprovado**, versão `1.4.8` / `10408`.
- O log `Build-Android-APK-12` foi analisado integralmente na etapa que falhou.
- `assembleRelease`: **aprovado**, com `BUILD SUCCESSFUL` e APK Release gerado.
- Secrets/keystore: **aprovados** nessa execução; o Gradle concluiu `validateSigningRelease`.
- Verificação pré-build do launcher: **aprovada** (`legacy 192x192`, `adaptive 432x432`).
- Causa do erro: a validação 1.4.7 exigia uma linha `application-icon-*` terminando em `ic_launcher.png` no `aapt dump badging`; essa saída não é estável para adaptive icons e gerou falso negativo após o APK já ter sido compilado corretamente.
- Correção: a validação 1.4.8 usa `aapt dump xmltree` no `AndroidManifest.xml` binário e `aapt dump resources` para resolver os IDs de `android:icon` e `android:roundIcon`.
- A comparação por pixels dos PNGs realmente empacotados continua ativa como segunda camada de validação.
