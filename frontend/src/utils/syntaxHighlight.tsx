import React from 'react';

export function highlightPython(line: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith('#')) {
    return <span className="syn-comment">{line}</span>;
  }

  // Regex tokenization for keywords, strings, functions
  const tokens: React.ReactNode[] = [];
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|class|from|import|return|raise|if|elif|else|not|in|as|with|try|except|del|and|or|for|while|True|False|None)\b|\b(?:HTTPException|User|Invoice|Cart|CartItem|DatabaseEngine|RateLimiter|BaseModel)\b|[a-zA-Z_]\w*(?=\()|#.*$|[^\w\s"']+|\s+|\w+)/g;

  let match;
  let idx = 0;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];
    const key = `${idx++}-${text}`;

    if (text.startsWith('#')) {
      tokens.push(<span key={key} className="syn-comment">{text}</span>);
    } else if (text.startsWith('"') || text.startsWith("'")) {
      tokens.push(<span key={key} className="syn-str">{text}</span>);
    } else if (/^(?:def|class|from|import|return|raise|if|elif|else|not|in|as|with|try|except|del|and|or|for|while|True|False|None)$/.test(text)) {
      tokens.push(<span key={key} className="syn-kw">{text}</span>);
    } else if (/^(?:HTTPException|User|Invoice|Cart|CartItem|DatabaseEngine|RateLimiter|BaseModel)$/.test(text)) {
      tokens.push(<span key={key} className="syn-type">{text}</span>);
    } else if (line[match.index + text.length] === '(') {
      tokens.push(<span key={key} className="syn-fn">{text}</span>);
    } else if (/^[!=<>]=?$/.test(text)) {
      tokens.push(<span key={key} className="syn-op">{text}</span>);
    } else {
      tokens.push(text);
    }
  }

  return tokens.length > 0 ? tokens : line;
}
