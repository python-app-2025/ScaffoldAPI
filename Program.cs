using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;
using ScaffoldAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Cors;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Добавление сервисов в контейнер
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.WebHost.ConfigureKestrel(options => {
        options.ListenLocalhost(5001, opts => {
        opts.UseHttps();
    });
});


// Добавление сервисов в контейнер

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "https://scaffoldapi.onrender.com",
            "http://localhost:3000",
            "https://localhost:5001",
            "http://localhost:8080"
        )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();


// Применение миграций при запуске
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Произошла ошибка при применении миграций");
    }
}

// 7. Конфигурация middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles(); // Для wwwroot

app.UseRouting();

// Активация CORS
app.UseCors("AllowAll");
// app.UseHttpsRedirection(); 
app.UseAuthorization();
app.UseStaticFiles();
app.MapFallbackToFile("index.html"); 
app.MapControllers();

app.Run();