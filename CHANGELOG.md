# Changelog

## 1.3.0 — 2026-09-15

- Entradas numéricas agora aceitam vírgula ou ponto decimal e exibem valores no padrão pt-BR.
- Quantidades por unidade permanecem inteiras e recebem separador de milhar automaticamente.
- Preços deixaram de depender da categoria e passam a pertencer individualmente a cada material.
- Categorias reorganizadas em Metais, Plásticos, Papel, Vidro, Baterias e Outros.
- Lista padrão ampliada com Inox, PEAD/HDPE, PP, Papel e Bateria automotiva.
- Materiais novos sem referência confiável entram com preço a definir, sem inventar valor de mercado.
- Migração automática preserva materiais, preços, quantidades, vendas e metas de versões anteriores.
- Home recebeu fundo mais neutro, cards mais compactos, preços por faixa quando necessário e progresso da meta de compra.
- Corrigida a exibição de peso com ponto decimal; toda a interface passa a usar formatação pt-BR.
- Calculadora ganhou proteção contra salvamento duplicado e opções de limpar ou continuar após salvar.
- Vendas agora pedem confirmação antes de excluir individualmente e podem ser carregadas novamente na Calculadora.
- Adicionada opção de doação via PIX `adriedson@outlook.com` com botão Copiar.
- Aba Sobre passa a funcionar também como Ajustes, permitindo alterar o nome do usuário.
- Android passa a usar modo tela cheia imersivo, ocultando barras do sistema e respeitando safe areas do app.
- `github-manager.json` atualizado com versão e lista de funções principais.
- Checagem de versão agora valida também `package-lock.json`.
- Versão atualizada para `1.3.0` / `10300`.

## 1.2.2 — 2026-09-15

- Adicionado `github-manager.json` para identificação de nome, versão e identidade do projeto.
- APK passou a ser publicado diretamente como asset da GitHub Release.
- Adicionada validação automática de versão.

## 1.2.0 — 2026-09-15

- Adicionada a tela Meta de compra.
- Lista de compras aceita vários produtos e soma os valores automaticamente.
- Metas podem ser salvas, reabertas e incluídas no backup.

## 1.1.1 — 2026-09-15

- Corrigida reutilização de IDs de materiais.
- Exclusão de material remove a quantidade persistida.
- Adicionado backup/restauração JSON.
- Persistência ganhou tratamento defensivo de erros.
- Removida dependência de Google Fonts e `allowMixedContent`.
- Versão centralizada e sincronizada com Android.
- `node_modules`, `dist` e Android gerado passaram a ser ignorados do pacote-fonte.
