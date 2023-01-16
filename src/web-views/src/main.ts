import './app.css';
import App from './App.svelte';

if (import.meta.env.DEV) {
  const testAnimMessage = {
    'type': 'anim',
    'img': 'data:image/png;base64,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',
    'fw': 16,
    'fh': 16,
    'x': 0,
    'y': 0,
    'width': 144,
    'height': 16,
    'length': 9,
    'time': 0.5,
    debug: true
  };
  const testWeaponMessage = {
    "img": "data:image/png;base64,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YmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczppcHRjRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6cGx1cz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi94bXAvMS4wLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6ZjdkNzkwMDUtNDdmMi00MDVhLWEzYWYtOWFjODc2YWE5NmIxIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmZjNWUxM2VkLWIyZTEtNDMyNy1iMDA0LWIwOWJhZjNkMzY3NSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmI0ZmFjY2VmLTU2NWUtNDgyZS04MjRhLWZlNmUzMzU0Njc2NCIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2MjIzODg2NDQxNjc5MzEiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4yMiIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIj4KICAgPGlwdGNFeHQ6TG9jYXRpb25DcmVhdGVkPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6TG9jYXRpb25DcmVhdGVkPgogICA8aXB0Y0V4dDpMb2NhdGlvblNob3duPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6TG9jYXRpb25TaG93bj4KICAgPGlwdGNFeHQ6QXJ0d29ya09yT2JqZWN0PgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6QXJ0d29ya09yT2JqZWN0PgogICA8aXB0Y0V4dDpSZWdpc3RyeUlkPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6UmVnaXN0cnlJZD4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjYzMDlhNDEtZjEyNy00NWE0LWJiY2ItNjBkODAyZWJjNjhhIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIxLTA1LTMwVDA4OjMwOjQ0Ii8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICAgPHBsdXM6SW1hZ2VTdXBwbGllcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkltYWdlU3VwcGxpZXI+CiAgIDxwbHVzOkltYWdlQ3JlYXRvcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkltYWdlQ3JlYXRvcj4KICAgPHBsdXM6Q29weXJpZ2h0T3duZXI+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpDb3B5cmlnaHRPd25lcj4KICAgPHBsdXM6TGljZW5zb3I+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpMaWNlbnNvcj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PiuspLwAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQflBR4PHiwfvptMAAAOFUlEQVR42u3dT2wc1R0H8O97M7M2CcRunG4aoSo5hGDLDlKpKAWqXOCE4BKa9tI2VGoDNJWQQBS5wXSJcVMqFcQBQYIqNVyq1pEPLeRQ2ktUVFmtqFSwnLq0hEtTL96wNiSxvTNvetid9czs7P+Z2d3Z70+y8s/Zj9/8+73fzLz3BNqMXek9dtDfr2QvC0QYdOnSZTC6M1o9nvUw8H0jw9idTpf/PL+4FEuj6dKly2B0Z7RyPOvcbAwGe7KszLh/uyGYkBgM9mRZmXH/MiExGAz23PuhMmMlyoTEYDDYc2d7mZAYDAaDlQqDCYnBYDBYqfRbQnJ6G5dyeVzK5Sv+LapeB126dBmM7q5CWzme9XbQU5mpmt8zmZkO/WSiS5cug9G9yaid41lvFb1z7EBHGkuXLl1WZozu279hHM+iHXh0YqLi30bHx/3ZMLQHhnTp0o21J4sob1MGPcuJY4qmfnA7sX/DOJ7beoZ08f33vejEBC4uLFTgYQddunRZmbFS6c79287xLNrZwP5wsmNUvTu6dOmG47IyY6USRcXf7vEsW4FXspeF80H7Roaxb2TYmyEXFiLJvHTp0g23J+v+itrspspsfnGp/FXrYtrrlUqc+zeM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",
    "fw": 30,
    "fh": 78,
    "x": 0,
    "y": 0,
    "width": 420,
    "height": 78,
    "length": 14,
    "debug": true,
    "type": "weapon",
    "chargedFrame": 7,
    "fireFrame": 10,
    "firePoint": {
      "x": 20,
      "y": 14
    },
    "mountPoint": {
      "x": 8,
      "y": 53
    }
  };
  globalThis.acquireVsCodeApi = function () {
    return {
      postMessage: (message) => {
        //set timeout to simulate what happens in vscode
        setTimeout(() => window.dispatchEvent(new MessageEvent('message', {data: testWeaponMessage})),
            1_000
        );
      }
    };
  };
}
const app = new App({
  target: document.getElementById('app'),
});

export default app;