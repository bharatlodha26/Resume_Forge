\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{bharatresume}[2026/06/20 Custom Resume Class]

\LoadClass[11pt, a4paper]{article}

% ============================================================
% Required Packages
% ============================================================
\RequirePackage[utf8]{inputenc}
\RequirePackage[lining, tabular]{ebgaramond}   % Garamond font
\RequirePackage[T1]{fontenc}
\RequirePackage{geometry}
\geometry{left=0.25in, right=0.25in, top=0.1in, bottom=0.1in}
\RequirePackage{longtable}
\RequirePackage{array}
\RequirePackage{xcolor}
\RequirePackage{colortbl}
\RequirePackage{enumitem}
\RequirePackage{hhline}

% ============================================================
% COLOR PALETTE — all resume colors defined here
% ============================================================
\definecolor{darkergray}{HTML}{BFBFBF}
\definecolor{headergray}{HTML}{DDDDDD}   % gray: section headers, job rows & left column
\definecolor{rulecolor}{HTML}{FFFFFF}    % white: all table borders (invisible)
\definecolor{namecolor}{HTML}{8B0000}    % dark red: candidate name

% ============================================================
% Table Formatting
% ============================================================
\renewcommand{\arraystretch}{0.95}
\setlength{\tabcolsep}{8pt}
\setlength{\arrayrulewidth}{1pt}
\arrayrulecolor{rulecolor}

% ============================================================
% Column Widths
% ============================================================
\newlength{\leftcol}    \setlength{\leftcol}{2.8cm}   % bullet-row left (label/category)
\newlength{\rightcol}   \setlength{\rightcol}{3.cm}  % bullet-row right (dates / institution)
\newlength{\midcol}
\setlength{\midcol}{\dimexpr\textwidth-\leftcol-\rightcol-4\tabcolsep\relax}
\newlength{\bodycol}
\setlength{\bodycol}{\dimexpr\textwidth-\leftcol-2\tabcolsep\relax}

% Job-heading parbox widths — independent of bullet-row columns
\newlength{\jobheadleft}  \setlength{\jobheadleft}{5.5cm}   % company name
\newlength{\jobheadright} \setlength{\jobheadright}{5.5cm}  % date range

% ============================================================
% Page Header
% ============================================================
\newcommand{\name}[1]{\def\@name{#1}}
\newcommand{\contact}[1]{\def\@contact{#1}}

\newcommand{\makeheader}{
    \thispagestyle{empty}
    \noindent
    {\Huge \textbf{\textcolor{namecolor}{\@name}}}%
    \hfill
    {\small \@contact}\par
    \vspace{-6pt}
    \noindent\rule{\textwidth}{0.5pt}
    \vspace{-24pt}
    \noindent
}

% ============================================================
% Resume Table — 2 Columns (left label, right body)
% ============================================================
\newcommand{\resumetable}{%
    \begin{longtable}{%
        @{}
        >{\centering\arraybackslash\columncolor{headergray}[0pt][\tabcolsep]}m{\leftcol} |
        >{\arraybackslash}m{\bodycol}
        @{}%
    }%
}

\RequirePackage{ragged2e}

% ============================================================
% Bullet Style — defined here so main.tex stays layout-free.
% Use inside \tworow: \tworow{label}{\begin{resumebullets}...\end{resumebullets}}
% ============================================================
\newenvironment{resumebullets}{%
    \begin{minipage}[c]{\linewidth}%
    \vspace{1pt}%
    \begin{itemize}[label={\rule[0.2ex]{3.5pt}{3.5pt}}, leftmargin=0.5em, itemsep=0.5pt, parsep=0pt,
                    topsep=0pt, partopsep=0pt, before=\justifying]%
}{%
    \end{itemize}%
    \vspace{1pt}%
    \end{minipage}%
}

% ============================================================
% Section-Level Macros (two commands, one for each heading type)
% ============================================================

% 1. Gray section header — spans full width, works for all sections
\newcommand{\resumesection}[1]{
    \hhline{--}
    \rowcolor{darkergray}[0pt][0pt]
    \multicolumn{2}{@{}l@{}}{\rule[-0.25em]{0pt}{1.3em}\textbf{\normalsize \hspace{4pt}#1}} \\
    \hhline{--}
    \noalign{\vspace{1pt}}
}

% 2. Job entry header — single gray cell with fixed parboxes for vertical alignment
%    \jobheadleft / \jobheadright control widths; mid fills remaining space.
\newcommand{\jobheading}[3]{
    \rowcolor{headergray}[0pt][0pt]
    \multicolumn{2}{@{}p{\dimexpr\textwidth+\arrayrulewidth\relax}@{}}{%
        \rule[-0.15em]{0pt}{1.2em}\hspace{2pt}%
        \parbox[c]{\jobheadleft}{\raggedright\textbf{#1}}%
        \hspace{2\tabcolsep}%
        \parbox[c]{\dimexpr\textwidth+\arrayrulewidth-\jobheadleft-\jobheadright-4\tabcolsep-8pt\relax}{\centering\textbf{#2}}%
        \hspace{2\tabcolsep}%
        \parbox[c]{\jobheadright}{\raggedleft\textbf{#3}}\hspace{2pt}} \\
    \hhline{--}
}

% ============================================================
% Data Row Macros (two commands, one for each layout type)
% ============================================================

% 1. Two-column row: left gray cell (label/category) + right cell spanning cols 2+3.
%    For bullet content: pass \begin{resumebullets}...\end{resumebullets}
%    For plain text:     pass text directly
\newcommand{\tworow}[2]{
    #1 & #2 \\
    \hhline{--}
}

\newcommand{\threerow}[3]{
    \rowcolor{headergray}[0pt][0pt]
    \multicolumn{2}{@{}p{\dimexpr\textwidth+\arrayrulewidth\relax}@{}}{%
        \begin{tabular}[c]{@{} 
            >{\centering\arraybackslash}m{\jobheadleft} | 
            >{\centering\arraybackslash}m{\dimexpr\textwidth-\jobheadleft-\jobheadright-4\tabcolsep-\arrayrulewidth\relax} | 
            >{\centering\arraybackslash}m{\jobheadright} @{}}
           \textbf{#1} & \textbf{#2} & \textbf{#3}
        \end{tabular}} \\
    \hhline{--}
}