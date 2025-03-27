using System.ComponentModel.DataAnnotations;

namespace ScaffoldAPI.Models
{
    public class ScaffoldCard
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "The lmo field is required.")]
        public string lmo { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The actNumber field is required.")]
        public string actNumber { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The requestNumber field is required.")]
        public string requestNumber { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The project field is required.")]
        public string project { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The sppElement field is required.")]
        public string sppElement { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The location field is required.")]
        public string location { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The requestDate field is required.")]
        public DateTime requestDate { get; set; }
        
        [Required(ErrorMessage = "The mountingDate field is required.")]
        public DateTime mountingDate { get; set; }
        
        [Required(ErrorMessage = "The dismantlingDate field is required.")]
        public DateTime dismantlingDate { get; set; }
        
        [Required(ErrorMessage = "The scaffoldType field is required.")]
        public string scaffoldType { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The length field is required.")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Length must be positive")]
        public decimal length { get; set; }
        
        [Required(ErrorMessage = "The width field is required.")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Width must be positive")]
        public decimal width { get; set; }
        
        [Required(ErrorMessage = "The height field is required.")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Height must be positive")]
        public decimal height { get; set; }
        
        public decimal volume => length * width * height;
        
        [Required(ErrorMessage = "The workType field is required.")]
        public string workType { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The customer field is required.")]
        public string customer { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The operatingOrganization field is required.")]
        public string operatingOrganization { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The ownership field is required.")]
        public string ownership { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "The status field is required.")]
        public string status { get; set; } = string.Empty;
    }
}