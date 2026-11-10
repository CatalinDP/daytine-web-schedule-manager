// Lets TypeScript import .svg files as text (see the "loader" option in angular.json)
declare module '*.svg' {
  const content: string;
  export default content;
}
