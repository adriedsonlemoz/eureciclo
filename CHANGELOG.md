# Changelog

## 1.2.1 — 2026-09-15

- Corrigido o workflow Android que falhava no `setup-android` ao tentar instalar o pacote legado `tools`.
- Atualizado `android-actions/setup-android` para v4 com instalação de pacotes adicionais desativada, evitando a falha `Failed to find package 'tools'`.
- Atualizados checkout/setup-node/setup-java para versões com runtime Node 24 e o Node do projeto no CI para 22.
- Adicionada verificação do Android SDK antes do build.
- APK do workflow agora é renomeado com a versão, por exemplo `Eu-Reciclo-v1.2.1.apk`.
- `versionName` e `versionCode` seguem sincronizados automaticamente (`1.2.1` / `10201`).

## 1.2.0 — 2026-09-15

- Adicionada a tela **Meta de compra**.
- A lista de compras aceita vários produtos e soma os valores automaticamente.
- O usuário escolhe um material e vê quantas unidades ou kg precisa juntar para pagar a compra.
- Para alumínio/latas e PET, o resultado é arredondado para uma unidade inteira para não ficar abaixo do valor-alvo.
- O progresso considera a quantidade já informada na Calculadora e mostra quanto ainda falta.
- Metas podem ser salvas, reabertas e excluídas.
- Metas salvas passaram a fazer parte do backup/restauração JSON.
- Adicionados testes específicos dos cálculos de meta.

## 1.1.1 — 2026-09-15

- Corrigida reutilização de IDs de materiais.
- Exclusão de material agora remove sua quantidade persistida.
- Adicionado backup/restauração JSON.
- Persistência ganhou tratamento defensivo de erros.
- Preços iniciais foram alinhados à documentação.
- Removidos contatos/PIX de exemplo.
- Removida dependência de Google Fonts para operação totalmente offline.
- Removido `allowMixedContent` desnecessário.
- Versão centralizada em `package.json` e sincronizada com Android.
- Adicionados testes dos cálculos e validação de backup.
- `node_modules`, `dist` e Android gerado passaram a ser ignorados no pacote-fonte.

## 1.1.0

- Renomeado para Eu Reciclo.
- Histórico de vendas.
- Melhorias de formatação e interface.
