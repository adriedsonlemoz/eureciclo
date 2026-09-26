# Validação — Eu Reciclo v1.4.11

Validações desta entrega:

- Novo arquivo mestre do ícone criado em `resources/android/source/app-icon-master.png`.
- Cantos pretos removidos da arte: o fundo verde agora ocupa todo o quadrado do launcher principal.
- `public/app-icon.png` e `src/assets/app-icon.png` sincronizados com a nova identidade.
- PNGs legacy regenerados para `mdpi`, `hdpi`, `xhdpi`, `xxhdpi` e `xxxhdpi`.
- Variantes `ic_launcher_round.png` possuem transparência externa em vez de preto.
- Adaptive icon preservado em `mipmap-anydpi-v26` para Android 8.0/API 26 ou superior.
- `android:icon` e `android:roundIcon` continuam apontando para os recursos oficiais.
- Splash nativa atualizada para a nova identidade.
- Verificação automática adicionada para rejeitar cantos pretos opacos no launcher principal.
- `npm test`: **34/34 testes aprovados**, incluindo a nova regressão de compatibilidade legacy/adaptive e proteção contra cantos pretos.
- `npm run check:version`: **aprovado**, versão `1.4.11` / `10411`, 32 funções declaradas.
- Verificação direta dos PNGs: os quatro cantos do launcher quadrado são verdes e opacos em todas as densidades; `roundIcon` usa transparência real nos cantos, sem pixels pretos.
- `npm run build` não foi repetido neste ambiente porque a reinstalação completa das dependências excedeu o tempo disponível; o workflow do GitHub continua responsável pelo build Android integral.
