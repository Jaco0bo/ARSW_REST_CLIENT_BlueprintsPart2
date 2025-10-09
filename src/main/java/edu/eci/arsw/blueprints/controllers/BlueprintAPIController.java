/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.controllers;

import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import edu.eci.arsw.persistence.BlueprintNotFoundException;
import edu.eci.arsw.persistence.BlueprintPersistenceException;
import edu.eci.arsw.services.BluePrintServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author hcadavid
 */
@RestController
@RequestMapping(value = "/blueprints")
public class BlueprintAPIController {
    @Autowired
    private BluePrintServices services;


    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> manejadorGetBluePrints() {
        try {
            Set <Blueprint> data = services.getAllBlueprints();
            return new ResponseEntity<>(data, HttpStatus.ACCEPTED);
        } catch (BlueprintPersistenceException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Plano no encontrado", HttpStatus.NOT_FOUND);
        } catch (ResourceNotFoundException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Error al obtener el plano", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(path = "/{author}", method = RequestMethod.GET)
    public ResponseEntity<?> getBlueprintsByAuthor(@PathVariable("author") String author) {
        try {
            Set <Blueprint> data = services.getBlueprintsByAuthor(author);
            return new ResponseEntity<>(data, HttpStatus.ACCEPTED);
        } catch (BlueprintNotFoundException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("NO SE ENCONTRARON PLANOS PARA EL AUTOR", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/{author}/{bpname}", method = RequestMethod.GET)
    public ResponseEntity<?> getBluePrint(@PathVariable("author") String author, @PathVariable("bpname") String bpname) {
        try {

            Blueprint bp = services.getBlueprint(author, bpname);

            if (bp != null) {
                // CONVERTIR A JSON
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writeValueAsString(bp);
                return new ResponseEntity<>(bp, HttpStatus.ACCEPTED);
            } else {
                return new ResponseEntity<>("NO EXISTE EL AUTOR O PLANO", HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("ERROR BUSCANDO AUTOR O PLANO", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> saveBluePrint(@RequestBody Blueprint bp){
        try {
            services.addNewBlueprint(bp);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (BlueprintPersistenceException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
    }

    @RequestMapping(path = "/{author}/{bpname}", method = RequestMethod.PUT)
    public ResponseEntity<?> modifyBluePrint(@RequestBody Blueprint bp,
                                             @PathVariable("author") String author,
                                             @PathVariable("bpname") String bpname) {
        try {
            services.modifyBluePrint(bp);

            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        } catch (BlueprintPersistenceException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("NO SE ENCONTRO NINGUN PLANO POR ESE AUTOR", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/{author}/{bpname}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteBlueprint(@PathVariable("author") String author,
                                             @PathVariable("bpname") String name) {
        try {
            services.removeBlueprint(author, name);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (BlueprintNotFoundException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("NO SE ENCONTRO NINGUN PLANO POR ESE AUTOR", HttpStatus.NOT_FOUND);
        } catch (BlueprintPersistenceException ex) {
            Logger.getLogger(BluePrintServices.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("ERROR AL ELIMINAR PLANO", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

