{ pkgs, ... }: {
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
  };

  scripts = {
    dev.exec = "npm run dev";
    build.exec = "npm run build";
  };
}
