#!/usr/bin/env python3
"""Generates api/migrations/005_translate_all_projects.sql from the data below.
Not part of the app — a one-off generator script, safe to delete after the
SQL file has been produced and reviewed."""

# category translations (shared vocabulary across all projects)
CATEGORIES = {
    "Finance": {"fr": "Finance", "de": "Finanzen", "es": "Finanzas", "ko": "금융", "ja": "ファイナンス"},
    "Consumer": {"fr": "Grand public", "de": "Verbraucher", "es": "Consumidor", "ko": "소비자", "ja": "コンシューマー"},
    "Experimental": {"fr": "Expérimental", "de": "Experimentell", "es": "Experimental", "ko": "실험적", "ja": "実験的"},
    "Developer Tools": {"fr": "Outils développeur", "de": "Entwickler-Tools", "es": "Herramientas para desarrolladores", "ko": "개발자 도구", "ja": "開発者ツール"},
    "Developer & Accessibility Tools": {"fr": "Outils développeur et accessibilité", "de": "Entwickler- und Barrierefreiheits-Tools", "es": "Herramientas de desarrollo y accesibilidad", "ko": "개발자 및 접근성 도구", "ja": "開発者・アクセシビリティツール"},
    "Lab": {"fr": "Laboratoire", "de": "Labor", "es": "Laboratorio", "ko": "랩", "ja": "ラボ"},
    "Creative": {"fr": "Créatif", "de": "Kreativ", "es": "Creativo", "ko": "크리에이티브", "ja": "クリエイティブ"},
}

# id -> {category (English, matches current base row), tagline per lang}.
# `name` is never translated (proper noun / brand name).
PROJECTS = {
    1: {
        "category": "Developer & Accessibility Tools",
        "tagline": {
            "fr": "Une inspection du DOM en direct qui transforme les problèmes RGAA et WCAG en correctifs que votre équipe peut vraiment livrer.",
            "de": "Live-DOM-Inspektion, die RGAA- und WCAG-Probleme in Korrekturen verwandelt, die Ihr Team tatsächlich ausliefern kann.",
            "es": "Inspección del DOM en vivo que convierte los problemas de RGAA y WCAG en correcciones que tu equipo puede implementar de verdad.",
            "ko": "RGAA와 WCAG 문제를 팀이 실제로 배포할 수 있는 수정안으로 바꿔주는 실시간 DOM 검사 도구.",
            "ja": "RGAAとWCAGの問題を、チームが実際に出荷できる修正に変える、ライブDOM検査ツール。",
        },
    },
    2: {
        "category": "Finance",
        "tagline": {
            "fr": "Un tableau de bord unique pour tous les comptes — PEA, PER, CTO — avec les indicateurs qui comptent.",
            "de": "Ein Dashboard für jedes Konto — PEA, PER, CTO — mit den KPIs, auf die es ankommt.",
            "es": "Un panel único para cada cuenta — PEA, PER, CTO — con los KPI que importan.",
            "ko": "PEA, PER, CTO 등 모든 계좌를 위한 하나의 대시보드 — 중요한 핵심 지표(KPI)와 함께.",
            "ja": "PEA、PER、CTOなど、あらゆる口座を一つのダッシュボードで — 本当に重要なKPIとともに。",
        },
    },
    3: {
        "category": "Creative",
        "tagline": {
            "fr": "Choisissez une image, sélectionnez un style, regardez-la se transformer.",
            "de": "Bild auswählen, Stil wählen, die Verwandlung beobachten.",
            "es": "Elige una imagen, elige un estilo, mira cómo se transforma.",
            "ko": "이미지를 고르고, 스타일을 선택하고, 변신하는 모습을 지켜보세요.",
            "ja": "画像を選び、スタイルを選ぶだけで、変身する様子を見届けよう。",
        },
    },
    4: {
        "category": "Developer Tools",
        "tagline": {
            "fr": "Des conseils d'accessibilité directement dans l'éditeur — templates Angular, ARIA, ordre de tabulation.",
            "de": "Barrierefreiheits-Hinweise direkt im Editor — Angular-Templates, ARIA, Fokusreihenfolge.",
            "es": "Orientación de accesibilidad directamente en el editor — plantillas Angular, ARIA, orden de foco.",
            "ko": "에디터 안에서 바로 확인하는 접근성 가이드 — Angular 템플릿, ARIA, 포커스 순서.",
            "ja": "エディタ内でアクセシビリティを確認 — Angularテンプレート、ARIA、フォーカス順。",
        },
    },
    5: {
        "category": "Developer Tools",
        "tagline": {
            "fr": "Axe-core et Playwright intégrés aux pull requests, pour qu'aucune régression ne passe.",
            "de": "Axe-core und Playwright direkt in Pull Requests eingebunden — Regressionen kommen nie durch.",
            "es": "Axe-core y Playwright integrados en los pull requests, para que ninguna regresión pase desapercibida.",
            "ko": "Axe-core와 Playwright를 풀 리퀘스트에 연결해, 회귀 버그가 절대 배포되지 않도록 합니다.",
            "ja": "Axe-coreとPlaywrightをプルリクエストに組み込み、リグレッションを絶対に出荷しない。",
        },
    },
    6: {
        "category": "Finance",
        "tagline": {
            "fr": "Plateforme de notation du risque de crédit.",
            "de": "Plattform zur Bewertung des Kreditrisikos.",
            "es": "Plataforma de calificación de riesgo crediticio.",
            "ko": "신용 위험 등급 평가 플랫폼.",
            "ja": "信用リスク格付けプラットフォーム。",
        },
    },
    7: {
        "category": "Finance",
        "tagline": {
            "fr": "Dividendes et revenus passifs, suivis par rapport à un véritable objectif d'indépendance.",
            "de": "Dividenden und passives Einkommen, verfolgt gegen ein echtes Unabhängigkeitsziel.",
            "es": "Dividendos e ingresos pasivos, seguidos frente a un objetivo real de independencia.",
            "ko": "실제 경제적 독립 목표에 맞춰 배당금과 수동 소득을 추적합니다.",
            "ja": "配当金と不労所得を、実際の経済的自立目標に照らして追跡。",
        },
    },
    8: {
        "category": "Finance",
        "tagline": {
            "fr": "Analyses d'investissement haut de gamme, avec une identité romaine singulière.",
            "de": "Premium-Anlageanalysen mit unverwechselbarer römischer Identität.",
            "es": "Análisis de inversión premium con una identidad romana distintiva.",
            "ko": "독특한 로마 정체성을 담은 프리미엄 투자 분석 서비스.",
            "ja": "ローマをモチーフにした個性的なデザインのプレミアム投資分析。",
        },
    },
    9: {
        "category": "Finance",
        "tagline": {
            "fr": "Des analyses d'entreprise modernes, pensées pour le comité de direction.",
            "de": "Moderne Business-Analytics, gemacht für die Chefetage.",
            "es": "Analítica empresarial moderna, pensada para la sala de juntas.",
            "ko": "이사회를 위한 현대적인 비즈니스 분석 대시보드.",
            "ja": "役員会のために作られた、モダンなビジネス分析ダッシュボード。",
        },
    },
    10: {  # lotoKarma — base row converted to English below; this is its `fr` row
        "category": "Consumer",
        "tagline": {
            "fr": (
                "Une application web moderne destinée aux joueurs des jeux FDJ — Loto, EuroMillions et Crescendo. "
                "lotoKarma permet de générer des grilles de jeu, de les confronter à l'historique complet des tirages, "
                "de consulter les archives et d'analyser des statistiques de fréquence pour affiner ses choix."
            ),
            "de": "Eine moderne Web-App für FDJ-Lotteriespieler — Loto, EuroMillions und Crescendo. Mit lotoKarma erstellen Sie Zahlenraster, gleichen sie mit der vollständigen Ziehungshistorie ab, durchsuchen die Archive und analysieren Häufigkeitsstatistiken, um Ihre Wahl zu verfeinern.",
            "es": "Una aplicación web moderna para los jugadores de la FDJ — Loto, EuroMillions y Crescendo. lotoKarma permite generar combinaciones, compararlas con el historial completo de sorteos, consultar los archivos y analizar estadísticas de frecuencia para afinar tus elecciones.",
            "ko": "FDJ 복권(Loto, EuroMillions, Crescendo) 이용자를 위한 현대적인 웹 애플리케이션입니다. lotoKarma로 번호 조합을 생성하고, 전체 추첨 기록과 비교하고, 기록 보관소를 확인하고, 빈도 통계를 분석해 선택을 다듬을 수 있습니다.",
            "ja": "FDJの宝くじ(Loto、EuroMillions、Crescendo)プレイヤー向けのモダンなウェブアプリです。lotoKarmaで数字の組み合わせを生成し、過去の抽選結果全体と照合し、アーカイブを閲覧し、頻度統計を分析して選択を洗練させることができます。",
        },
    },
    11: {
        "category": "Consumer",
        "tagline": {
            "fr": "Swipez jusqu'à la boîte de réception vide, avec des niveaux et des séries.",
            "de": "Wische dich zur leeren Inbox — mit Levels und Serien.",
            "es": "Desliza hasta vaciar tu bandeja de entrada, con niveles y rachas.",
            "ko": "레벨과 연속 기록으로 스와이프하며 받은편지함을 비워보세요.",
            "ja": "レベルと連続記録で、スワイプしながら受信箱をゼロに。",
        },
    },
    12: {
        "category": "Lab",
        "tagline": {
            "fr": "Un animal virtuel avec un journal de soins et des mini-jeux.",
            "de": "Ein virtuelles Haustier mit Pflegetagebuch und Minispielen.",
            "es": "Una mascota virtual con un diario de cuidados y minijuegos.",
            "ko": "돌봄 일지와 미니게임이 있는 가상 반려동물.",
            "ja": "お世話日記とミニゲームがある、バーチャルペット。",
        },
    },
    13: {
        "category": "Lab",
        "tagline": {
            "fr": "Découvrez les artistes et groupes qui correspondent à vos goûts.",
            "de": "Entdecke die Künstler und Gruppen, die zu deinem Geschmack passen.",
            "es": "Descubre los artistas y grupos que encajan con tus gustos.",
            "ko": "내 취향에 맞는 아티스트와 그룹을 발견하세요.",
            "ja": "自分の好みに合うアーティストやグループを発見。",
        },
    },
    14: {
        "category": "Lab",
        "tagline": {
            "fr": "Une encyclopédie de la K-pop — chronologies, groupes, recommandations.",
            "de": "Eine K-Pop-Enzyklopädie — Zeitleisten, Gruppen, Empfehlungen.",
            "es": "Una enciclopedia del K-pop — cronologías, grupos, recomendaciones.",
            "ko": "K-팝 백과사전 — 연혁, 그룹, 추천 정보.",
            "ja": "K-POP百科事典 — 年表、グループ、おすすめ情報。",
        },
    },
    15: {
        "category": "Lab",
        "tagline": {
            "fr": "Raids, équipement et objectifs hebdomadaires, pour chacun de vos personnages.",
            "de": "Raids, Ausrüstung und wöchentliche Ziele, für jeden Twink.",
            "es": "Incursiones, equipo y objetivos semanales, para cada personaje secundario.",
            "ko": "모든 부캐를 위한 레이드, 장비, 주간 목표 관리.",
            "ja": "すべてのサブキャラのための、レイド・装備・週間目標管理。",
        },
    },
    16: {
        "category": "Lab",
        "tagline": {
            "fr": "Un concept de compagnon doux, pensé pour les utilisateurs seniors.",
            "de": "Ein sanftes Begleiter-Konzept, entwickelt für ältere Nutzer.",
            "es": "Un concepto de compañero suave, pensado para usuarios mayores.",
            "ko": "고령 사용자를 위해 설계된, 온화한 동반자 컨셉.",
            "ja": "高齢者向けに設計された、やさしいコンパニオンのコンセプト。",
        },
    },
    17: {  # Lenormand — base row converted to English below; this is its `fr` row
        "category": "Experimental",
        "tagline": {
            "fr": "De la cartomancie : on mélange, on coupe, on tire — comme avec un vrai jeu.",
            "de": "Kartenlegen: mischen, abheben, ziehen — wie mit einem echten Kartenspiel.",
            "es": "Cartomancia: se baraja, se corta, se saca una carta — como con una baraja real.",
            "ko": "카드 점술: 섞고, 자르고, 뽑는다 — 진짜 카드처럼.",
            "ja": "カードトランプ占い: シャッフルし、カットし、引く — 本物のカードのように。",
        },
    },
}

# lotoKarma (id 10) and Lenormand (id 17) currently have their *base* row in
# French, not English — inconsistent with the other 15 projects and with
# this migration's assumption that base = English. Converting base to
# English here; their original French (completed where it was truncated —
# see the lotoKarma note below) becomes their `fr` translation row above,
# preserving the wording as originally authored rather than re-translating it.
BASE_FIXUPS = {
    10: "A modern web app for FDJ lottery players — Loto, EuroMillions and Crescendo. lotoKarma lets you generate number grids, check them against the complete draw history, browse the archives, and analyze frequency statistics to refine your choices.",
    17: "Cartomancy: shuffle, cut, draw — just like with a real deck.",
}


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


lines = []
lines.append("-- Generated by 005_translate_all_projects.sql.py — translations for the")
lines.append("-- 17 projects live on sn8w.com as of 2026-09-09. Review before running.")
lines.append("")
lines.append("-- lotoKarma's and Lenormand's base `projects.tagline` was in French, not")
lines.append("-- English like every other project's base row. lotoKarma's was also")
lines.append("-- truncated mid-word (from before the column was widened past its old")
lines.append("-- character cap) -- completed here (the obvious end of that clause,")
lines.append("-- \"pour affiner ses choix\") before translating. Their original French")
lines.append("-- text is preserved below as the `fr` translation row, unchanged in")
lines.append("-- meaning -- only the base row's language changes, to English, matching")
lines.append("-- every other project.")
for pid, english_tagline in BASE_FIXUPS.items():
    lines.append(f"UPDATE projects SET tagline = '{esc(english_tagline)}' WHERE id = {pid};")
lines.append("")
lines.append("INSERT INTO project_translations (project_id, lang, category, tagline) VALUES")

rows = []
for pid, data in PROJECTS.items():
    en_category = data["category"]
    for lang in ["fr", "de", "ko", "ja", "es"]:
        tagline = data["tagline"][lang]
        category = CATEGORIES[en_category][lang]
        rows.append(f"  ({pid}, '{lang}', '{esc(category)}', '{esc(tagline)}')")

lines.append(",\n".join(rows) + "\nON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);")

with open("005_translate_all_projects.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"Wrote {len(rows)} translation rows to 005_translate_all_projects.sql")
