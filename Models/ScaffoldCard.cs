using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScaffoldAPI.Models
{
    public class ScaffoldCard
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Поле ЛМО обязательно для заполнения")]
        public string lmo { get; set; } = "Лесавик"; // Значение по умолчанию

        [Required(ErrorMessage = "Номер акта обязателен")]
        public string actNumber { get; set; } = "АКТ-0001"; // Значение по умолчанию

        [Required(ErrorMessage = "Номер заявки обязателен")]
        public string requestNumber { get; set; } = "ЗАЯВКА-0001"; // Значение по умолчанию

        [Required(ErrorMessage = "Проект обязателен")]
        public string project { get; set; } = "Проект"; // Значение по умолчанию

        public string sppElement { get; set; } = "СПП-элемент"; // Значение по умолчанию

        [Required(ErrorMessage = "Расположение обязательно")]
        public string location { get; set; } = "Участок"; // Значение по умолчанию

        [Required(ErrorMessage = "Дата заявки обязательна")]
        public DateTime requestDate { get; set; } = DateTime.Today; // Текущая дата

        [Required(ErrorMessage = "Дата монтажа обязательна")]
        public DateTime mountingDate { get; set; } = DateTime.Today; // Текущая дата

        public DateTime? dismantlingDate { get; set; }
        public DateTime? acceptanceRequestDate { get; set; }
        public DateTime? acceptanceDate { get; set; }
        public DateTime? dismantlingRequestDate { get; set; }
        public string? dismantlingRequestNumber { get; set; }

        [Required(ErrorMessage = "Тип лесов обязателен")]
        public string scaffoldType { get; set; } = "Стоечные"; // Значение по умолчанию

        [Range(0.1, double.MaxValue, ErrorMessage = "Длина должна быть больше 0")]
        public decimal length { get; set; } = 1m; // Значение по умолчанию

        [Range(0.1, double.MaxValue, ErrorMessage = "Ширина должна быть больше 0")]
        public decimal width { get; set; } = 1m; // Значение по умолчанию

        [Range(0.1, double.MaxValue, ErrorMessage = "Высота должна быть больше 0")]
        public decimal height { get; set; } = 1m; // Значение по умолчанию

        public decimal volume { get; private set; }

        [Required(ErrorMessage = "Вид работ обязателен")]
        public string workType { get; set; } = "Монтаж"; // Значение по умолчанию

        [Required(ErrorMessage = "Заказчик обязателен")]
        public string customer { get; set; } = "ПАО НЛМК"; // Значение по умолчанию

        [Required(ErrorMessage = "Эксплуатирующая организация обязательна")]
        public string operatingOrganization { get; set; } = "ПАО НЛМК"; // Значение по умолчанию

        [Required(ErrorMessage = "Принадлежность обязательна")]
        public string ownership { get; set; } = "ПАО НЛМК"; // Значение по умолчанию

        public string status { get; set; } = "Монтаж"; // Значение по умолчанию
        public string currentStage { get; set; } = "Заявка на монтаж"; // Значение по умолчанию

        public void CalculateVolume()
        {
            volume = length * width * height;
        }

        /// <summary>
        /// Переводит карточку на следующий этап
        /// </summary>
        public void MoveToNextStage()
        {
            switch(currentStage)
            {
                case "Заявка на монтаж":
                    currentStage = "Допуск";
                    status = "Принято (в работе)";
                    break;
                case "Допуск":
                    currentStage = "Демонтаж";
                    status = "Демонтировано";
                    break;
                case "Демонтаж":
                    // Карточка завершена, дальше этапов нет
                    status = "Завершено";
                    break;
                default:
                    throw new InvalidOperationException($"Неизвестный этап: {currentStage}");
            }
        }

        /// <summary>
        /// Проверяет, можно ли перейти на следующий этап
        /// </summary>
        public bool CanMoveToNextStage()
        {
            return currentStage switch
            {
                "Заявка на монтаж" => !string.IsNullOrEmpty(lmo) && 
                                     !string.IsNullOrEmpty(actNumber) && 
                                     !string.IsNullOrEmpty(project) &&
                                     mountingDate != default,
                "Допуск" => acceptanceDate.HasValue && 
                           !string.IsNullOrEmpty(status),
                "Демонтаж" => dismantlingDate.HasValue && 
                             !string.IsNullOrEmpty(dismantlingRequestNumber),
                _ => false
            };
        }
    }
}