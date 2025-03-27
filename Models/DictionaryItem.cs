using System.ComponentModel.DataAnnotations;

namespace ScaffoldAPI.Models
{
    public class DictionaryItem
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!; // "LMO", "Project", "SppElement", "Organization"
        public string Value { get; set; } = null!;
        
    }
}