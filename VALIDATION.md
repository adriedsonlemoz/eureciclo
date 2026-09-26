# Validação — Eu Reciclo v1.4.10

Validações desta entrega:

- Log `Build-Android-APK-14` analisado integralmente na etapa que falhou.
- `assembleRelease`: **aprovado**; o APK `app-release.apk` foi gerado antes da falha de validação.
- Verificação do launcher dentro do APK: **aprovada**; Manifest e `resources.arsc` resolveram `@mipmap/ic_launcher`, `@mipmap/ic_launcher_round`, `@drawable/ic_launcher_foreground` e `@color/ic_launcher_background`.
- `apksigner verify`: **aprovado**, com assinatura v1 e v2 válidas, 1 signatário e certificado `CN=Eu Reciclo, OU=Android, O=Eu Reciclo, L=Sao Paulo, ST=SP, C=BR`.
- SHA-256 informado pelo `apksigner`: `ac4d833375b94bcebce4386077085825e561c03f7f1cd6864ed99d8fb2759906`.
- Keystore permanente reconstruído localmente a partir dos secrets fornecidos: certificado SHA-256 **idêntico** (`ac4d833375b94bcebce4386077085825e561c03f7f1cd6864ed99d8fb2759906`).
- Causa da falha: o workflow 1.4.9 extraía somente linhas iniciadas por `Signer #1 certificate SHA-256 digest:`; o SDK atual retornou `V2 Signer: certificate SHA-256 digest:` e a variável ficou vazia.
- Correção 1.4.10: novo parser de relatório aceita os formatos `V2 Signer` e `Signer #1`, normaliza o SHA-256 e rejeita saída sem certificado ou com mais de um certificado distinto.
- `npm test`: **33/33 testes aprovados**, incluindo regressão para `V2 Signer`, `Signer #1` e relatório sem digest.
- `npm run check:version`: **aprovado**, versão `1.4.10` / `10410`, 31 funções declaradas, ícone Android e assinatura Release prontos.
