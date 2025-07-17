package backend.dto;

import java.util.Date;

public record ErrorDetailsDto(Date timestamp,
                              String message,
                              String details) {

}
