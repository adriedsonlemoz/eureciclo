# Eu Reciclo 🌿

Aplicativo mobile para calcular o valor estimado de materiais recicláveis, registrar vendas e manter preços personalizados. Construído com **Vue 3 + Vite + Tailwind CSS + Capacitor**.

## Versão

- App: **1.2.1**
- Android `versionCode`: **10201** (gerado automaticamente a partir da versão)
- Application ID: `com.eureciclo.app`

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build | Vite 5 |
| Estilo | Tailwind CSS 3 |
| Persistência | localStorage com backup JSON |
| Mobile | Capacitor 6 (Android) |
| Fonte | Pilha nativa do sistema (offline) |

## Funcionalidades

- Calculadora por categoria e material
- Conversão de unidades para kg
- Cadastro, edição e exclusão de materiais
- Preços personalizados por kg
- Histórico de vendas com snapshot dos itens
- Meta de compra: converte o preço de produtos em latinhas, unidades ou kg necessários
- Lista de compras com vários produtos e metas salvas
- Backup e restauração em JSON
- Funcionamento offline
- Build de APK pelo GitHub Actions

## Preços iniciais sugeridos

Os valores são apenas pontos de partida e podem ser alterados no primeiro uso:

- Alumínio / Latas: R$ 6,00/kg
- PET: R$ 2,50/kg
- Cobre / Latão: R$ 30,00/kg
- Papel, baterias e outros: R$ 3,00/kg

## Desenvolvimento

Pré-requisitos: Node.js 22+, npm e Java 17 para Android.

```bash
npm ci
npm test
npm run dev
```

Para build web:

```bash
npm run build
```

Para Android local:

```bash
npm run build
npx cap add android   # apenas se android/ não existir
npx cap sync android
npm run sync:android-version
cd android
./gradlew assembleDebug
```

## Sobre o tamanho do projeto

`node_modules/`, `dist/` e `android/` gerado não fazem parte do ZIP de código-fonte. O `package-lock.json` mantém as versões das dependências e `npm ci` as reinstala quando necessário. Isso reduz o pacote de dezenas de megabytes para apenas o código necessário.

## Persistência e segurança dos dados

Os dados ficam no dispositivo. Use **Sobre → Backup dos dados → Exportar** periodicamente. O arquivo inclui materiais, preços, quantidades atuais, nome, histórico de vendas e metas de compra.

## Estrutura

```text
src/
├── components/
├── composables/
├── config/
├── stores/
├── utils/
└── views/
tests/
scripts/
.github/workflows/build-apk.yml
```
