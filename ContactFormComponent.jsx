@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Plus Jakarta Sans", sans-serif;
  overflow-x: clip;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;

    /* Primary: Green */
    --primary: 142 71% 30%;
    --primary-foreground: 0 0% 100%;

    /* Secondary: Navy Blue */
    --secondary: 217 70% 20%;
    --secondary-foreground: 0 0% 100%;

    /* Accent: Navy Blue (kept consistent with palette) */
    --accent: 217 70% 20%;
    --accent-foreground: 0 0% 100%;

    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 142 71% 30%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 217 70% 10%;
    --foreground: 0 0% 100%;

    --primary: 142 71% 40%;
    --primary-foreground: 0 0% 100%;

    --secondary: 217 60% 30%;
    --secondary-foreground: 0 0% 100%;

    --accent: 142 71% 40%;
    --accent-foreground: 0 0% 100%;

    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    --card: 217 70% 13%;
    --card-foreground: 0 0% 100%;

    --popover: 217 70% 13%;
    --popover-foreground: 0 0% 100%;

    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 142 71% 40%;

    --destructive: 0 62% 30%;
    --destructive-foreground: 0 0% 100%;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}