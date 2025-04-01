using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScaffoldAPI.Models
{
    public class ScaffoldCard
    {
        public int Id { get; set; }
        
       
        public string lmo { get; set; } = string.Empty;
        
        
        public string actNumber { get; set; } = string.Empty;
        
        
        public string requestNumber { get; set; } = string.Empty;
        
       
        public string project { get; set; } = string.Empty;
        
        
        public string sppElement { get; set; } = string.Empty;
        
       
        public string location { get; set; } = string.Empty;
        
        
        public DateTime requestDate { get; set; }
        
        
        public DateTime mountingDate { get; set; }
        
        
        public DateTime dismantlingDate { get; set; }

        [DisplayName("Дата заявки на приемку")]
        public DateTime? acceptanceRequestDate { get; set; }
        
        [DisplayName("Дата приемки")]
        public DateTime? acceptanceDate { get; set; }

            // Этап 3: Демонтаж
        [DisplayName("Дата заявки на демонтаж")]
        public DateTime? dismantlingRequestDate { get; set; }
        
        [DisplayName("Номер заявки на демонтаж")]
        public string? dismantlingRequestNumber { get; set; }
        
       
        public string scaffoldType { get; set; } = string.Empty;
        
        
        [Range(0.1, double.MaxValue, ErrorMessage = "Length must be positive")]
        public decimal length { get; set; }
        
        
        [Range(0.1, double.MaxValue, ErrorMessage = "Width must be positive")]
        public decimal width { get; set; }
        
        
        [Range(0.1, double.MaxValue, ErrorMessage = "Height must be positive")]
        public decimal height { get; set; }
        
        public decimal volume { get; private set; }
        public void CalculateVolume()
        {
        volume = length * width * height;
        }
        
        
        public string workType { get; set; } = string.Empty;
        
        
        public string customer { get; set; } = string.Empty;
        
        
        public string operatingOrganization { get; set; } = string.Empty;
        
        
        public string ownership { get; set; } = string.Empty;
        
        [DisplayName("Статус")]
        public string status { get; set; } = "Монтаж"; // Статусы: Монтаж, Принято (в работе), Не принято, Демонтировано
        
        [DisplayName("Текущий этап")]
        public string currentStage { get; set; } = "Заявка на монтаж"; // Этапы: Заявка на монтаж, Допуск, Демонтаж

            // Метод для перехода на следующий этап
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
                    break;
            }
        }
    }
}