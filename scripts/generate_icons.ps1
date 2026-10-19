Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

function Create-AppIcon {
    param(
        [int]$size,
        [string]$filePath
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#4f46e5')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#7c3aed')
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)

    # Rounded rect background
    $radius = [int]($size * 0.22)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $g.FillPath($brush, $path)

    # White checkmark
    $penWidth = [float]($size * 0.1)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $penWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $p1 = New-Object System.Drawing.PointF([float]($size * 0.28), [float]($size * 0.52))
    $p2 = New-Object System.Drawing.PointF([float]($size * 0.44), [float]($size * 0.68))
    $p3 = New-Object System.Drawing.PointF([float]($size * 0.74), [float]($size * 0.35))

    $points = [System.Drawing.PointF[]]@($p1, $p2, $p3)
    $g.DrawLines($pen, $points)

    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created icon: $filePath"
}

Create-AppIcon -size 192 -filePath (Join-Path $iconsDir "icon-192.png")
Create-AppIcon -size 512 -filePath (Join-Path $iconsDir "icon-512.png")
