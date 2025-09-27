export const buildLinkedInShareUrl = ({ url, title, summary, source = 'EventChain' }) => {
  const params = new URLSearchParams({
    mini: 'true',
    url,
    title,
    summary,
    source
  });
  return `https://www.linkedin.com/shareArticle?${params.toString()}`;
};

export const buildTwitterShareUrl = ({ url, text, hashtags = [] }) => {
  const params = new URLSearchParams({
    url,
    text,
    hashtags: hashtags.join(',')
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};
