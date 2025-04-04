{ pkgs, ... }:
{
  tasks = {
    "bash:backend:install" = {
      exec = ''
        UV_PROJECT_ENVIRONMENT=$(pwd)/backend/.venv
        UV_PYTHON_DOWNLOADS=never
        UV_PYTHON_PREFERENCE=system
        if [[ -d backend && ! -e backend/instance ]]; then
          make -C backend install
          make -C backend create-site
        fi
      '';
      before = [
        "devenv:enterShell"
      ];
    };
  };

  languages.python = {
    enable = true;
    package = pkgs.python311;
    uv = {
      enable = true;
      package = pkgs.uv;
    };
  };

  enterShell = ''
    if [[ -d backend && ! -e backend/instance ]]; then
      export UV_PROJECT_ENVIRONMENT=$(pwd)/backend/.venv
    fi
    export UV_PYTHON_DOWNLOADS=never
    export UV_PYTHON_PREFERENCE=system
  '';
}
