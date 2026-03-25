import ipCalculatorLogo from "../../images/ip-calculator-logo.png";
import nyxGuardLogo from "../../images/nyx-guard-logo-chrome.png";
import nyxMonitorLogo from "../../images/nyx-monitor-logo.png";

export const heroContent = {
  topLabel: "PORTFOLIO PERSONAL",
  status: "ASIER",
  title: "Ciberseguridad y desarrollo de software.",
  summary:
    "Portfolio enfocado en seguridad ofensiva, defensa y desarrollo de herramientas con un planteamiento tecnico, claro y orientado a resultados.",
};

export const projects = [
  {
    slug: "nyx-monitor",
    title: "Nyx-Monitor",
    stack: "React / Tauri / Rust / Windows",
    summary:
      "Aplicacion de escritorio para observabilidad de procesos y deteccion heuristica de actividad sospechosa en tiempo real.",
    href: "https://github.com/asier-toraya/Nyx-Monitor",
    image: nyxMonitorLogo,
    imageAlt: "Logo de Nyx-Monitor",
  },
  {
    slug: "nyx-guard",
    title: "Nyx-Guard",
    stack: "Chromium Extension / Risk Scoring",
    summary:
      "Extension para Chromium que analiza paginas web y genera una puntuacion de riesgo con contexto reputacional.",
    href: "https://github.com/asier-toraya/Nyx-Guard",
    image: nyxGuardLogo,
    imageAlt: "Logo de Nyx-Guard",
  },
  {
    slug: "ip-calculator",
    title: "IP Calculator",
    stack: "Python / Tkinter / IPv4",
    summary:
      "Aplicacion de escritorio para calculo de redes IPv4, subnetting y VLSM con enfoque didactico y visual.",
    href: "https://github.com/asier-toraya/ip_calculator",
    image: ipCalculatorLogo,
    imageAlt: "Logo de IP Calculator",
  },
  {
    slug: "siem-elastic",
    title: "SIEM-ELASTIC",
    stack: "Docker / ELK / Snort / Lab",
    summary:
      "Laboratorio de ciberseguridad con stack ELK, Snort, Filebeat y servicios de apoyo para generar y visualizar eventos.",
    href: "https://github.com/asier-toraya/SIEM-ELASTIC",
    image: null,
    imageAlt: "Placeholder de SIEM-ELASTIC",
  },
];

export const workshopPlaceholders = [
  {
    title: "Placeholder",
    summary: "Espacio reservado para futuros talleres y laboratorios practicos.",
  },
  {
    title: "Placeholder",
    summary: "Seccion preparada para incorporar contenido mas adelante.",
  },
  {
    title: "Placeholder",
    summary: "Proximamente se anadiran talleres guiados y material aplicable.",
  },
];
