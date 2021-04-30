import { useEffect } from 'react';

export const UtterancesCommentaries: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');

    if (anchor.children.length > 0) {
      anchor.removeChild(anchor.children[0]);
    }

    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute(
      'repo',
      'lucasdu4rte/ignite-desafio-reactjs-criando-um-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'photon-dark');
    anchor.appendChild(script);
  });

  return <div id="inject-comments-for-uterances" />;
};
