# Бэкенд (C#)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файлы проекта и восстанавливаем зависимости
COPY ["ScaffoldAPI.csproj", "./"]
RUN dotnet restore "ScaffoldAPI.csproj"

# Копируем всё остальное (включая фронтенд в wwwroot)
COPY . .
RUN dotnet build "ScaffoldAPI.csproj" -c Release -o /app/build

# 2. Этап публикации
FROM build AS publish
RUN dotnet publish "ScaffoldAPI.csproj" -c Release -o /app/publish

# 3. Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Копируем опубликованные файлы (включая wwwroot)
COPY --from=publish /app/publish .

# Опционально: копируем сертификаты для HTTPS
# COPY ./certs /app/certs

# Указываем порты
EXPOSE 80
EXPOSE 443

# Запускаем приложение
ENTRYPOINT ["dotnet", "ScaffoldAPI.dll"]