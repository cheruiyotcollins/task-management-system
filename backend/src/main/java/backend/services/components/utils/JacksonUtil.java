package backend.services.components.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * @author Kibet
 * 2025/01/7
 */
@Slf4j
public class JacksonUtil {
    static ObjectMapper objectMapper = new ObjectMapper();

    static {
        objectMapper.registerModule(new JavaTimeModule());
        // Ignore redundant fields in json strings
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
    }

    private JacksonUtil(){
    }

    public static JsonNode readTree(String json){
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            log.error("",e);
            return null;
        }
    }

    public static <T> T treeToValue(JsonNode node , Class<T> clazz){
        try {
            return objectMapper.treeToValue(node,clazz);
        } catch (JsonProcessingException e) {
            log.error("",e);
            return null;
        }
    }

    public static <T> List<T> treeToListValue(JsonNode node , Class<T> clazz){
        try {
            JavaType javaType = getObjectiveJavaType(List.class, clazz);
            return objectMapper.treeToValue(node,javaType);
        } catch (JsonProcessingException e) {
            log.error("",e);
            return Collections.emptyList();
        }
    }

    public static <T> T parseObject(String json, Class<T> clazz) {
        try {
            return objectMapper.readerFor(clazz).readValue(json);
        } catch (IOException e) {
            log.error("",e);
            return null;
        }
    }
    public static <T> T parseObject(String json, TypeReference<T> valueTypeRef) {
        try {
            return objectMapper.readValue(json,valueTypeRef);
        } catch (IOException e) {
            log.error("",e);
            return null;
        }
    }

    public static String writeAsJsonString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (IOException e) {
            log.error("",e);
            return "";
        }
    }

    public static <T> List<T> jsonString2List(String jsonString, Class<T> clazz) {
        try {
            JavaType javaType = getObjectiveJavaType(List.class, clazz);
            return objectMapper.readerFor(javaType).readValue(jsonString);
        } catch (IOException e) {
            log.error("",e);
            return Collections.emptyList();
        }
    }

    /**
     * Convert objects to json strings, ignoring null values
     */
    public static String writeAsJsonStringIgnoreNull(Object object) {
        try {
            objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
            return objectMapper.writeValueAsString(object);
        } catch (IOException e) {
            log.error("",e);
            return "";
        }
    }

    public static JavaType getObjectiveJavaType(Class<?> collectionClass,
                                                Class<?>... elementClasses) {
        return objectMapper.getTypeFactory()
                .constructParametricType(collectionClass, elementClasses);
    }

    public <T> T readValue(String json,Class<?> collectionClass, Class<?>... elementClasses){
        try {
            return objectMapper.readValue(json,objectMapper.getTypeFactory()
                    .constructParametricType(collectionClass, elementClasses));
        } catch (JsonProcessingException e) {
            log.error("",e);
            return null;
        }
    }
}

