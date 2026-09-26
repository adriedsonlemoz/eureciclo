# Validação — Eu Reciclo v1.4.9

Validações desta entrega:

- `npm test`: **30/30 testes aprovados**, incluindo fixture que simula caminhos de recursos encurtados em APK Release.
- `npm run check:version`: **aprovado**, versão `1.4.9` / `10409`.
- O log `Build-Android-APK-13` foi analisado na etapa que falhou.
- `assembleRelease`: **aprovado**, com `BUILD SUCCESSFUL in 1m 22s` e 147 tarefas executadas.
- Assinatura: o Gradle concluiu `validateSigningRelease` e gerou `app-release.apk`.
- Verificação pré-build do launcher: **aprovada** (`legacy 192x192`, `adaptive 432x432`).
- O próprio APK confirmou `android:icon=0x7f0c0000 -> @mipmap/ic_launcher` e `android:roundIcon=0x7f0c0001 -> @mipmap/ic_launcher_round`.
- Causa do erro: o verificador 1.4.8 procurava obrigatoriamente o arquivo físico `res/mipmap-xxxhdpi/ic_launcher.png` no ZIP do APK. Em Release, `optimizeReleaseResources` pode encurtar os caminhos físicos; por isso `legacyEntry` ficou vazio mesmo com o recurso correto presente na `resources.arsc`.
- Correção 1.4.9: Manifest binário + `resources.arsc` são a prova principal da identidade do launcher; caminhos físicos otimizados são usados apenas para uma comparação adicional de pixels quando disponíveis.
