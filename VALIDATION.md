# Validação — Eu Reciclo v1.4.7

Validações locais executadas nesta entrega:

- `npm test`: **28/28 testes aprovados**.
- `npm run check:version`: **aprovado**, versão `1.4.7` / `10407`.
- Recursos oficiais do launcher presentes em todas as densidades Android.
- `scripts/apply-android-icon.mjs` remove variantes herdadas do Capacitor antes de aplicar os recursos oficiais.
- `scripts/verify-android-icon.mjs`: valida o projeto Android gerado e também o APK final; a validação do projeto foi executada com sucesso em fixture contendo recursos padrão do Capacitor.
- O workflow executa a checagem do ícone antes e depois do build.

Observação: o log `Build-Android-APK-11` encerrou antes da compilação porque os quatro GitHub Secrets de assinatura chegaram vazios ao runner. Isso é configuração do repositório, não falha do recurso de ícone. O workflow mantém a proteção: não publica APK Release sem a chave permanente.
