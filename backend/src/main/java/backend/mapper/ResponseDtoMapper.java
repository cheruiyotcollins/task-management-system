package backend.mapper;

import backend.dto.ResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ResponseDtoMapper {

    // method overloading to handle null payloads
    public ResponseEntity<ResponseDto> responseDtoSetter(HttpStatus httpStatus, String description, Object payload){
        return new ResponseEntity<>(ResponseDto.builder().payload(payload).status(httpStatus).description(description).build(), httpStatus);
    }
    public ResponseEntity<ResponseDto> responseDtoSetter(HttpStatus httpStatus, String description){
        return new ResponseEntity<>(ResponseDto.builder().status(httpStatus).description(description).build(), httpStatus);
    }
}
