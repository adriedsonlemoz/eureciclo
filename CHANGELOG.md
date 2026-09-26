# Changelog

## 1.4.10 — 2026-09-26

- Corrigido o falso erro `O certificado do APK não corresponde ao keystore permanente configurado` observado no `Build-Android-APK-14`.
- Os logs confirmaram que o APK Release foi compilado, o launcher oficial foi validado dentro do APK e a assinatura era válida com certificado `CN=Eu Reciclo`.
- A causa era o parser da etapa de segurança: ele procurava somente a linha antiga `Signer #1 certificate SHA-256 digest`, enquanto a versão atual do `apksigner` retornou `V2 Signer: certificate SHA-256 digest`.
- Adicionado extrator dedicado para o SHA-256 do certificado, compatível com os formatos atuais e legados do `apksigner` e com rejeição de relatórios sem certificado ou com certificados diferentes.
- Adicionados testes de regressão para as saídas `V2 Signer` e `Signer #1`.
- Mantidas intactas as validações do ícone oficial, assinatura Release permanente e comparação com o certificado do keystore.
- Versão sincronizada em `1.4.10` / `10410`.

## 1.4.9 — 2026-09-26

- Corrigido o falso erro `recurso legacyEntry não foi empacotado no APK` observado no `Build-Android-APK-13`.
- Confirmado pelos próprios logs que o APK Release foi compilado com sucesso e que o Manifest empacotado aponta `android:icon` para `@mipmap/ic_launcher` e `android:roundIcon` para `@mipmap/ic_launcher_round`.
- A validação pós-build deixou de exigir nomes físicos como `res/mipmap-xxxhdpi/ic_launcher.png`, pois o otimizador de recursos do Android pode encurtar esses caminhos em builds Release.
- O verificador agora usa Manifest binário + `resources.arsc` como fonte principal e confirma `ic_launcher`, `ic_launcher_round`, `ic_launcher_foreground` e `ic_launcher_background` pelo nome semântico compilado.
- Quando a `resources.arsc` expõe o caminho físico otimizado do PNG, os pixels ainda são comparados com os recursos oficiais; quando o caminho é omitido/encurtado pela ferramenta, a validação semântica permanece válida sem gerar falso negativo.
- Adicionados testes de regressão simulando APK Release com caminhos físicos encurtados (`res/a0.png`, `res/a1.png`, etc.) e saída do `aapt` sem caminhos físicos legíveis.
- Versão sincronizada em `1.4.9` / `10409`.

## 1.4.8 — 2026-09-26

- Corrigido falso erro da validação pós-build do launcher: o `aapt dump badging` pode anunciar adaptive icons como XML ou omitir as linhas `application-icon-*`, portanto não é uma fonte estável para exigir `ic_launcher.png`.
- A validação agora lê `android:icon` e `android:roundIcon` diretamente do `AndroidManifest.xml` binário dentro do APK.
- Os IDs de recurso do Manifest são resolvidos na `resources.arsc` e precisam apontar exatamente para `@mipmap/ic_launcher` e `@mipmap/ic_launcher_round`.
- Mantida a verificação forte dos arquivos realmente empacotados: launcher legacy, launcher redondo, adaptive icon e foreground; os PNGs continuam sendo comparados por pixels com os recursos oficiais.
- O log `Build-Android-APK-12` confirmou que o APK Release 1.4.7 compilou e foi assinado corretamente; a falha ocorreu somente na checagem antiga do nome exibido pelo `badging`.
- Versão sincronizada em `1.4.8` / `10408`.

## 1.4.7 — 2026-09-26

- Reforçada a aplicação do ícone oficial do Eu Reciclo no launcher Android.
- Removidas automaticamente variantes de ícone herdadas do template do Capacitor antes de copiar os recursos oficiais.
- Camada do adaptive icon movida para `drawable-xxxhdpi`, preservando 432 px como 108 dp.
- Adicionada validação do Manifest e dos recursos Android gerados antes do build.
- Adicionada validação pós-build que abre o APK, confere `aapt dump badging` e compara os pixels do launcher com os recursos oficiais.
- O APK deixa de ser publicado se o ícone empacotado não corresponder ao ícone oficial.
- Versão sincronizada em `1.4.7` / `10407`.

## 1.4.6 — 2026-09-26

- Build Android de produção migrado de `assembleDebug` para `assembleRelease`.
- GitHub Actions passa a reconstruir o keystore temporariamente a partir de `ANDROID_KEYSTORE_BASE64` e exige os quatro secrets de assinatura permanente.
- Adicionado `scripts/configure-android-signing.mjs`, que injeta a configuração Release no projeto Android gerado pelo Capacitor sem gravar senhas ou chave no repositório.
- Removido qualquer fallback silencioso para assinatura Debug no fluxo de produção.
- O APK final é validado com `apksigner` e seu SHA-256 de certificado é comparado ao certificado exportado do keystore antes da publicação.
- Pull requests executam testes e lint Android sem produzir APK de distribuição.
- `.gitignore` reforçado para bloquear `.jks`, `.keystore` e `key.properties`.
- `package.json`, `package-lock.json` e `github-manager.json` sincronizados em `1.4.6` / `10406`.

## 1.4.5 — 2026-09-26

- Corrigido o espaço branco inferior do onboarding: rotas sem navegação inferior deixam de herdar o padding reservado ao menu principal e passam a preencher a altura dinâmica do aparelho.
- Recursos oficiais do ícone Android foram restaurados no pacote-fonte para `mdpi`, `hdpi`, `xhdpi`, `xxhdpi` e `xxxhdpi`, incluindo ícone redondo, foreground adaptativo e splash.
- O ícone do Eu Reciclo passa a ser aplicado explicitamente ao Manifest durante `android:prepare`, evitando o robô padrão do template no launcher/tela de instalação.
- Adicionada a tela “Novidades e correções”, exibida uma única vez por versão depois da configuração inicial ou na primeira abertura após atualização.
- A tela de novidades pode ser reaberta manualmente em Ajustes.
- `package.json`, `package-lock.json` e `github-manager.json` sincronizados em `1.4.5` / `10405`.

## 1.4.4 — 2026-09-15

- Corrigido o build Android que falhava em `processDebugResources` por uso inválido de cor hexadecimal diretamente em `android:drawable` na splash nativa.
- O fundo da splash agora é gerado como um `shape` drawable válido com `solid android:color`, preservando a identidade visual do Eu Reciclo.
- Adicionado teste de regressão para impedir que cores literais voltem a ser usadas em atributos `android:drawable`.
- GitHub Manager, `package.json`, `package-lock.json` e Android sincronizados em `1.4.4` / `10404`.

## 1.4.3 — 2026-09-15

- Corrigidos launcher e splash nativa para usar a identidade oficial do Eu Reciclo em vez dos recursos padrão do template Android.
- Manifest e tema de lançamento Android passam a ser sincronizados automaticamente durante `android:prepare`.
- Onboarding ficou mais compacto, priorizando materiais principais e deixando os demais recolhidos.
- Entrada de preço ganhou instrução explícita (`7` ou `7,00`) e confirmação para valores muito acima das referências iniciais do app.
- Filtros horizontais da Calculadora e Materiais ganharam indicação/controle de continuação.
- Feedback após salvar venda ficou menor e menos intrusivo.
- Vendas agora separam valor estimado do valor realmente recebido e aceitam comprador/local opcional.
- Exclusão de material saiu da lista principal e foi movida para a tela de edição com confirmação.
- Novo/Editar Material passou a escolher cor automaticamente pela categoria; personalização visual ficou opcional.
- Histórico de mudanças em Ajustes passou a ficar recolhido por padrão.
- GitHub Manager, `package.json`, `package-lock.json` e Android sincronizados em `1.4.3` / `10403`.

## 1.4.2 — 2026-09-15

- Corrigido o pacote-fonte: os recursos binários do ícone Android agora são incluídos no ZIP enviado ao GitHub.
- A validação de recursos Android agora confere todas as densidades do launcher, ícones redondos e foreground adaptativo.
- Mantida a correção do `ic_launcher_background` sem recursos duplicados.
- GitHub Manager, `package.json`, `package-lock.json` e Android sincronizados em `1.4.2` / `10402`.

## 1.4.1 — 2026-09-15

- Corrigido o build Android que falhava em `mergeDebugResources` por definição duplicada de `ic_launcher_background`.
- O script do ícone agora reutiliza o recurso padrão `values/ic_launcher_background.xml` do Android em vez de criar uma segunda definição.
- O script remove automaticamente o arquivo legado `eu_reciclo_icon.xml` caso exista, evitando regressão em builds incrementais.
- Adicionado teste de regressão para impedir que o recurso duplicado do launcher volte ao projeto.
- Ícone oficial e modo de tela cheia da 1.4.0 foram preservados.
- GitHub Manager, `package.json`, `package-lock.json` e Android sincronizados em `1.4.1` / `10401`.

## 1.4.0 — 2026-09-15

- Calculadora compactada para exibir mais materiais por tela sem perder preço, conversão e resultado.
- Barra de total foi reduzida e reposicionada acima da navegação inferior.
- Safe area e espaçamento inferior foram reforçados para evitar conteúdo coberto pela barra de navegação.
- Categorias vazias deixam de aparecer na Home; os atalhos mostram no máximo quatro categorias antes de “Ver todas”.
- Chips de categoria ficaram menores e ganharam indicação visual de rolagem horizontal.
- Campos de preço e peso reforçados com `inputmode`, `pattern` e normalização de vírgula/ponto.
- Adicionados testes explícitos para `2,5`, `2.5` e `1250.50`.
- Ícones vetoriais consistentes passaram a substituir emojis nas telas principais.
- Áreas de toque de editar/excluir materiais foram ampliadas.
- Vendas e Meta de compra foram revisadas para usar a mesma linguagem visual.
- Ícone oficial do Eu Reciclo foi integrado à Home, Ajustes, favicon e recursos Android.
- `android:prepare` agora aplica automaticamente o ícone do launcher depois que o Capacitor gera a plataforma.
- GitHub Manager, `package.json`, `package-lock.json` e Android sincronizados em `1.4.0` / `10400`.

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
