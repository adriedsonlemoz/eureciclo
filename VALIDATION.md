# Validação — Eu Reciclo v1.4.6

## Validações executadas

- `npm test`: **27/27 testes aprovados**.
- `npm run check:version`: **aprovado**, versão `1.4.6` / `10406`.
- YAML do workflow: **válido**.
- Script de assinatura aplicado em um `build.gradle` de teste: **aprovado**, com `signingConfigs.release` e sem fallback Debug.
- Workflow não contém `assembleDebug` nem referência a `app-debug.apk`.
- Build de produção usa `assembleRelease` e `app-release.apk`.
- Os quatro GitHub Secrets de assinatura são obrigatórios fora de pull requests.
- O keystore é reconstruído somente no runner temporário e não entra no repositório.
- `apksigner` valida a assinatura e o SHA-256 do certificado do APK é comparado ao certificado do keystore.
- `.jks`, `.keystore` e `key.properties` estão bloqueados no `.gitignore`.
- O arquivo de secrets gerado anteriormente foi validado sem expor seus valores: o keystore abre com a senha/alias informados e a chave privada aceita a senha configurada.

## Comandos principais do CI

```bash
npm ci
npm test
npm run check:version
npm run build
npx cap add android   # quando android/ ainda não existir
npm run android:prepare
npm run configure:android-signing
cd android
./gradlew assembleRelease --no-daemon
```

A validação criptográfica final depende dos GitHub Secrets reais e acontece no runner de release, porque a chave permanente não deve ser incluída no pacote-fonte. Neste ambiente, `npm ci` não concluiu dentro do limite disponível, então o build Vite/Gradle completo não foi marcado como validação local.
