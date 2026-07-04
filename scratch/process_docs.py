import os

source_file = r"c:\Users\Devansh\Desktop\Risk Aware Fraud Transaction Decision System\PROJECT_DOCUMENTATION\docs_viewer.html"
target_file = r"c:\Users\Devansh\Desktop\Risk Aware Fraud Transaction Decision System\frontend-glass\docs.html"

with open(source_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update title and add fonts
fonts_html = """
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
"""
html = html.replace('<title>Risk-Aware Fraud System — Project Documentation</title>', 
                    '<title>Project Documentation | MARI</title>\n' + fonts_html)

# 2. Update styling to match brand
html = html.replace("font-family: 'Segoe UI', system-ui, sans-serif;", "font-family: 'Inter', system-ui, sans-serif;")
html = html.replace("font-family: 'Cascadia Code', 'Fira Code', monospace;", "font-family: 'JetBrains Mono', monospace;")

# Update CSS variables to be slightly closer to dark theme if needed, but docs_viewer already looks dark and cool.
# Let's add an explicit 'Back to Home' entry in the sidebar.

home_nav = """
        <div class="nav-item" style="border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 8px;" onclick="window.location.href='/'">
            <span class="nav-icon">⬅️</span>
            <span class="nav-label">Back to System</span>
        </div>
"""

# Insert right after the sidebar header
html = html.replace('<div id="sidebar-header">\n            <h2>Risk Aware Fraud System</h2>\n            <p>Project Documentation</p>\n        </div>', 
                    '<div id="sidebar-header">\n            <h2>Risk Aware Fraud System</h2>\n            <p>Project Documentation</p>\n        </div>\n' + home_nav)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("docs.html generated successfully!")
