# Validação — Eu Reciclo v1.4.5

## Validações executadas

- `npm test`: **21/21 testes aprovados**.
- `npm run check:version`: **aprovado**, versão `1.4.5` / `10405`.
- Aplicação dos recursos Android em projeto temporário: **aprovada**.
- Manifest recebeu `@mipmap/ic_launcher` e `@mipmap/ic_launcher_round`.
- `versionName` e `versionCode` Android foram sincronizados corretamente.
- Recursos de launcher, adaptive icon e splash estão presentes no pacote-fonte.

## Comandos do CI

```bash
npm ci
npm test
npm run check:version
npm run build
npx cap add android   # quando android/ ainda não existir
npm run android:prepare
```

O build completo Vite/Gradle permanece a cargo do workflow de release; neste ambiente a instalação das dependências npm não concluiu, então não foi marcado como validação local.
