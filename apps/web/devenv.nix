{ pkgs, ... }: {
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_20;
  };

  scripts = {
    dev.exec = "npm run dev";
    build.exec = "npm run build";
  };
}
