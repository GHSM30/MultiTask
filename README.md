This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

Para poder ejecutar el proyecto necesitan instalar varias cosas en consola:
Primero que nada ya deben tener Node.js instalado en su computadora
Instala Node.js y npm: [https://nodejs.org/](https://nodejs.org/).
Una vez ya instalado Node.js y npm seguimos con estos pasos:

1. Crea un nuevo proyecto Next.js:
Abre una terminal en Visual Studio Code (Terminal > New Terminal) y ejecuta los siguientes comandos:

npx create-next-app@latest multitask
cd multitask

Durante la configuración, selecciona las siguientes opciones:
- Would you like to use TypeScript? › Yes
- Would you like to use ESLint? › Yes
- Would you like to use Tailwind CSS? › Yes
- Would you like to use `src/` directory? › No
- Would you like to use App Router? › Yes
- Would you like to customize the default import alias? › No

2. Instala las dependencias adicionales:
En la terminal, ejecuta:
npm install framer-motion lucide-react

3. Configura shadcn/ui:
Ejecuta los siguientes comandos:
npx shadcn@latest init

Sigue las instrucciones del asistente. Cuando te pregunte sobre el estilo, elige el que prefieras.

4. Instala los componentes de shadcn/ui que estamos utilizando:
npx shadcn@latest add button card input

Con todas las dependencias instaladas ya deberia funcionar el proyecto.
Inicia el servidor con:
npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
