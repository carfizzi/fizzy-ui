// `import('x.css', { with: { loader: 'text' } })` returns the file as a string.
declare module '*.css' {
  const text: string;
  export default text;
}
