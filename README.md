# Eu Reciclo 🌿

Aplicativo mobile para calcular o valor estimado de materiais recicláveis, registrar vendas, criar metas de compra e manter preços personalizados. Construído com **Vue 3 + Vite + Tailwind CSS + Capacitor**.

## Versão

- App: **1.4.10**
- Android `versionCode`: **10410**
- Application ID: `com.eureciclo.app`

## Funcionalidades

- Calculadora compacta por categoria e material
- Entradas numéricas em pt-BR com suporte a vírgula ou ponto decimal
- Conversão de unidades para kg
- Cadastro, edição e exclusão de materiais
- Preço independente para cada material
- Categorias: Metais, Plásticos, Papel, Vidro, Baterias e Outros
- Lista padrão ampliada com Alumínio/Latas, PET, Cobre, Latão, Ferro/Aço, Inox, PEAD/HDPE, PP, Plástico Misto, Papelão, Papel, Vidro, Pilhas/Baterias pequenas e Bateria automotiva
- Histórico de vendas com confirmação de exclusão
- Proteção contra salvamento duplicado de uma mesma venda
- Carregar uma venda antiga de volta na Calculadora
- Meta de compra com vários produtos e progresso na Home
- Backup e restauração em JSON
- Doação via PIX com botão de copiar (`adriedson@outlook.com`)
- Funcionamento offline
- Modo Android em tela cheia imersivo
- Ícone oficial aplicado ao APK, favicon e identidade interna
- Ícones vetoriais consistentes nas telas principais
- Safe area reforçada para o conteúdo não ficar sob a navegação inferior
- Onboarding em tela cheia, sem faixa branca inferior
- Tela de novidades e correções exibida uma vez por versão após instalar ou atualizar
- APK Release assinado com chave permanente e publicado diretamente na GitHub Release

## Preços iniciais

Os valores já existentes nas versões anteriores são preservados como ponto de partida. Materiais novos sem referência confiável entram com **preço a definir**, evitando inventar valor de mercado. Cada preço pode ser alterado individualmente em **Materiais**.

## Números

Campos de preço e peso aceitam tanto vírgula quanto ponto decimal e normalizam a exibição para pt-BR.

Exemplos:

```text
3,25      → 3,25
3.25      → 3,25
1250      → 1.250
1250,5    → 1.250,5
1250.5    → 1.250,5
1.234,56  → 1.234,56
1,234.56  → 1.234,56
```

Campos por unidade são mantidos como inteiros.

## Desenvolvimento

Pré-requisitos: Node.js 22+, npm e Java 17 para Android.

```bash
npm ci
npm test
npm run dev
```

Build web:

```bash
npm run build
```

Android local para desenvolvimento:

```bash
npm run build
npx cap add android   # apenas se android/ não existir
npm run android:prepare
```

Para gerar um APK de produção, configure `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD` no ambiente e execute:

```bash
npm run configure:android-signing
cd android
./gradlew assembleRelease
```

`android:prepare` sincroniza o Capacitor, aplica `versionName/versionCode`, ativa o modo tela cheia imersivo e instala os recursos do ícone oficial no Android. `configure:android-signing` exige a chave permanente e não possui fallback para certificado Debug. A validação pós-build lê `android:icon` e `android:roundIcon` no Manifest binário do APK e resolve os IDs na `resources.arsc`. Ela não depende de nomes físicos como `res/mipmap-xxxhdpi/ic_launcher.png`, porque o otimizador Release do Android pode encurtar esses caminhos. Quando a tabela de recursos expõe o PNG físico otimizado, os pixels também são comparados com os arquivos oficiais.

## GitHub Manager

`github-manager.json` contém identidade, versão, `versionCode`, `applicationId`, repositório e a lista das principais funções do app. O comando abaixo valida a consistência antes do build:

```bash
npm run check:version
```

A validação compara `package.json`, `package-lock.json` e `github-manager.json`.

## APK direto

O workflow não usa `actions/upload-artifact` como entrega principal. Em `main`/`master` ou execução manual, exige os GitHub Secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`, gera o **APK Release assinado**, confere o certificado com `apksigner` e publica **`Eu-Reciclo-v1.4.10.apk`** diretamente como asset da Release `v1.4.10`. Em pull requests, os testes e o lint Android rodam sem acesso aos secrets e nenhum APK é publicado. A leitura do SHA-256 do certificado aceita tanto o formato atual `V2 Signer` quanto o formato legado `Signer #1` emitidos pelo `apksigner`.

## Tamanho do projeto

`node_modules/`, `dist/` e `android/` gerado não entram no ZIP-fonte. O `package-lock.json` mantém as versões das dependências e `npm ci` reinstala o necessário no CI.

## Dados e backup

Os dados ficam no aparelho. Use **Ajustes → Backup dos dados → Exportar** periodicamente. O backup inclui materiais, esquema da lista de materiais, preços, quantidades, nome, vendas e metas de compra.
