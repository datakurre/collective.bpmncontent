{ pkgs, ... }:
{
  packages = [
    (pkgs.vscode-with-extensions.override {
      vscodeExtensions = [
        pkgs.vscode-extensions.bbenoist.nix
        pkgs.vscode-extensions.ms-vscode-remote.remote-containers
        pkgs.vscode-extensions.github.copilot
        pkgs.vscode-extensions.github.copilot-chat
        pkgs.vscode-extensions.vscodevim.vim
      ];
    })
  ];
}
